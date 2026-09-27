"""Процедурное видео: рассвет над горным озером.

Всё рисуется кодом (numpy), кадры кодируются в MP4 через ffmpeg.
Запуск:  pip install numpy imageio-ffmpeg && python sunrise.py
"""
import math
import subprocess
import sys

import imageio_ffmpeg
import numpy as np

W, H = 1280, 720
FPS = 30
SECONDS = 10
FRAMES = FPS * SECONDS
HORIZON = int(H * 0.62)          # линия воды
OUT = sys.argv[1] if len(sys.argv) > 1 else "sunrise.mp4"

rng = np.random.default_rng(7)
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)


def lerp(a, b, t):
    return a + (b - a) * t


def smooth(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def ridge(seed, base, amp, octaves=6):
    """Силуэт горного хребта: сумма синусов с разными частотами."""
    r = np.random.default_rng(seed)
    x = np.arange(W, dtype=np.float32)
    y = np.zeros(W, dtype=np.float32)
    freq, a = 1.5, amp
    for _ in range(octaves):
        phase = r.uniform(0, 2 * math.pi)
        y += a * (1 - np.abs(np.sin(x / W * freq * math.pi + phase)))
        freq *= 2.1
        a *= 0.48
    return base - y


# Три слоя гор: дальний, средний, ближний.
LAYERS = [
    (ridge(1, HORIZON - 30, 150), np.array([0.30, 0.30, 0.45]), 0.55),
    (ridge(2, HORIZON + 30, 150), np.array([0.16, 0.16, 0.26]), 0.30),
    (ridge(3, HORIZON + 40, 110), np.array([0.05, 0.05, 0.09]), 0.10),
]

STARS = np.stack([rng.uniform(0, W, 260), rng.uniform(0, HORIZON - 60, 260),
                  rng.uniform(0.3, 1.0, 260)], axis=1)

# Птицы: стартовая позиция, скорость, фаза взмахов.
BIRDS = [(rng.uniform(-300, 200), rng.uniform(120, 260), rng.uniform(55, 80),
          rng.uniform(0, 6)) for _ in range(6)]

# Статичный шум для ряби на воде.
NOISE = rng.standard_normal((H, W)).astype(np.float32)


def sky(t, sun_x, sun_y):
    """Градиент неба, который меняется от ночи к утру."""
    night_top, night_bot = np.array([0.02, 0.03, 0.10]), np.array([0.10, 0.08, 0.22])
    dawn_top, dawn_bot = np.array([0.18, 0.30, 0.62]), np.array([1.00, 0.62, 0.35])
    k = smooth(t)
    top = lerp(night_top, dawn_top, k)
    bot = lerp(night_bot, dawn_bot, k)
    v = (ys / HORIZON)[..., None]
    img = lerp(top, bot, np.clip(v, 0, 1) ** 1.4)

    # Свечение вокруг солнца.
    d = np.sqrt((xs - sun_x) ** 2 + ((ys - sun_y) * 1.3) ** 2)
    glow = np.exp(-d / (160 + 120 * k))[..., None] * (0.35 + 0.65 * k)
    img += glow * np.array([1.0, 0.70, 0.35])

    # Диск солнца (круглый, в отличие от свечения). Возвращаем и небо без диска,
    # чтобы горы в дымке не просвечивали солнцем.
    r = np.sqrt((xs - sun_x) ** 2 + (ys - sun_y) ** 2)
    disk = smooth((34 - r) / 2.5)[..., None]
    return lerp(img, np.array([1.0, 0.95, 0.80]), disk), img


def draw_stars(img, t):
    alpha = float(np.clip(1 - t * 2.2, 0, 1))
    if alpha <= 0:
        return
    for x, y, b in STARS:
        xi, yi = int(x), int(y)
        img[yi, xi] = np.maximum(img[yi, xi], b * alpha)


def draw_mountains(img, sky_img, t, sun_x):
    k = smooth(t)
    for i, (prof, color, fog) in enumerate(LAYERS):
        mask = ys >= prof[None, :]
        lit = color * (0.35 + 0.75 * k)
        # Подсветка склонов со стороны солнца.
        side = np.clip(1 - np.abs(xs - sun_x) / W, 0, 1)[..., None]
        shade = lit + side * np.array([0.25, 0.12, 0.02]) * k * (1 - i * 0.3)
        # Воздушная перспектива: дальние слои тонут в цвете неба, у подножия — дымка.
        haze = fog + np.clip((ys - prof[None, :]) / 140, 0, 1)[..., None] * 0.3 * (1 - i * 0.4)
        layer = lerp(shade, sky_img, np.clip(haze, 0, 0.9))
        img[mask] = layer[mask]


def draw_birds(img, t, frame):
    k = smooth((t - 0.35) / 0.3)
    if k <= 0:
        return
    col = np.array([0.05, 0.05, 0.08])
    for x0, y0, speed, ph in BIRDS:
        x = x0 + speed * frame / FPS * 3
        y = y0 + 10 * math.sin(frame / 20 + ph)
        flap = 6 * math.sin(frame / 3 + ph)
        for s in (-1, 1):
            for j in range(14):
                px = int(x + s * j)
                py = int(y - (j / 14) * flap - abs(j - 7) * 0.3)
                if 0 <= px < W - 1 and 0 <= py < H - 1:
                    img[py:py + 2, px:px + 2] = lerp(img[py:py + 2, px:px + 2], col, k)


def reflect(img, frame, sun_x):
    """Отражение неба и гор в воде с рябью."""
    depth = ys[HORIZON:] - HORIZON
    wave = (np.sin(depth * 0.35 - frame * 0.25 + xs[HORIZON:] * 0.01) * 2.5
            + NOISE[HORIZON:] * 0.15) * (0.3 + depth / (H - HORIZON))
    src_y = np.clip(HORIZON - 1 - depth + wave, 0, HORIZON - 1).astype(int)
    src_x = np.clip(xs[HORIZON:] + wave * 1.5, 0, W - 1).astype(int)
    water = img[src_y, src_x] * 0.72 + np.array([0.01, 0.03, 0.06])

    # Солнечная дорожка на воде.
    path = np.exp(-np.abs(xs[HORIZON:] - sun_x) / (18 + depth * 0.6))
    sparkle = np.clip(np.sin(xs[HORIZON:] * 0.9 + depth * 1.7 + frame * 0.6) + NOISE[HORIZON:] * 0.3, 0, 1)
    water += (path * sparkle * 0.9)[..., None] * np.array([1.0, 0.75, 0.45])
    img[HORIZON:] = water


def render(frame):
    t = frame / (FRAMES - 1)
    sun_x = W * 0.58
    sun_y = lerp(HORIZON - 60, HORIZON - 360, smooth(t * 1.05))
    img, sky_img = sky(t, sun_x, sun_y)
    draw_stars(img, t)
    draw_mountains(img, sky_img, t, sun_x)
    draw_birds(img, t, frame)
    reflect(img, frame, sun_x)

    # Затемнение по краям и плавное появление/исчезновение.
    vign = 1 - 0.35 * (((xs - W / 2) / (W / 2)) ** 2 + ((ys - H / 2) / (H / 2)) ** 2)
    img *= vign[..., None]
    fade = min(1.0, frame / FPS, (FRAMES - 1 - frame) / (FPS * 0.7))
    img *= fade
    return (np.clip(img, 0, 1) ** (1 / 1.1) * 255).astype(np.uint8)


def main():
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
           "-movflags", "+faststart", OUT]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in range(FRAMES):
        proc.stdin.write(render(f).tobytes())
        if f % FPS == 0:
            print(f"кадр {f}/{FRAMES}", flush=True)
    proc.stdin.close()
    proc.wait()
    print("готово:", OUT)


if __name__ == "__main__":
    main()
