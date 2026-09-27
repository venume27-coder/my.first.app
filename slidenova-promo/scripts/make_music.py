"""Генератор фоновой музыки для промо-ролика → public/music.mp3

Трек синтезируется кодом (без сэмплов и чужой музыки), 120 BPM, ля минор,
и сведён под сценарий ролика: тиканье часов в хуке, дроп на «Есть решение»,
удары на каждой склейке, брейкдаун в «Переходах», финальный аккорд.

    pip install numpy scipy imageio-ffmpeg
    python scripts/make_music.py
"""
import os
import subprocess

import imageio_ffmpeg
import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM  # 0.5 с
# Длительность сцен в битах — как SCENE_BEATS в src/config.ts
SCENES = [6, 8, 14, 12, 12, 12, 10, 14, 16]
TOTAL_BEATS = sum(SCENES)  # 104
CUTS = np.cumsum(SCENES)[:-1].tolist()  # биты склеек: 6, 14, 28, …
OUTRO = TOTAL_BEATS - 3  # последние 1,5 с — чистая плашка
BREAK = (64, 74)  # сцена «Переходы» — брейкдаун
DURATION = TOTAL_BEATS * BEAT + 0.5
N = int(DURATION * SR)

rng = np.random.default_rng(42)
t_all = np.arange(N) / SR


def bt(beat):
    return int(round(beat * BEAT * SR))


def note(n):
    """MIDI → Гц."""
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, 'low', fs=SR, output='sos'), x)


def hp(x, cutoff, order=2):
    return sosfilt(butter(order, cutoff, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def place(buf, sig, at, gain=1.0):
    i = bt(at) if isinstance(at, (int, float)) else at
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def saw(freq, dur, detune=0.0):
    t = np.arange(int(dur * SR)) / SR
    ph = (t * freq * (1 + detune) + rng.random()) % 1.0
    return 2 * ph - 1


def env(dur, a=0.005, d=0.2, s=0.0, r=0.05):
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    rel = int(r * SR)
    if rel and n > rel:
        e[-rel:] *= np.linspace(1, 0, rel)
    return e


# ─── Инструменты ─────────────────────────────────────────────────────────
def kick():
    d = 0.45
    t = np.arange(int(d * SR)) / SR
    f = 45 + 110 * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.004) * 0.3
    return np.tanh((body + click) * 1.6)


def clap():
    d = 0.35
    n = int(d * SR)
    noise = bp(rng.standard_normal(n), 900, 5000)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        e += np.where(t >= off, np.exp(-(t - off) / (0.012 if k < 2 else 0.12)), 0)
    return noise * e * 0.5


def hat(open_=False):
    d = 0.25 if open_ else 0.06
    n = int(d * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t / (0.08 if open_ else 0.015)) * 0.35


def tick():
    d = 0.08
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * 2400 * t) + 0.5 * np.sin(2 * np.pi * 3600 * t)) * np.exp(-t / 0.012) * 0.5


def crash():
    d = 2.2
    n = int(d * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 4000) * np.exp(-t / 0.55) * 0.45


def boom():
    d = 1.4
    t = np.arange(int(d * SR)) / SR
    f = 38 + 60 * np.exp(-t / 0.08)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) * 0.9


def riser(beats):
    d = beats * BEAT
    n = int(d * SR)
    t = np.arange(n) / SR
    x = t / d
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # полосовой шум, центр полосы растёт
    chunks = 24
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        fc = 400 * (1 + 20 * (c / chunks) ** 2)
        out[a:b] = bp(noise[a:b], fc, min(fc * 2.5, 18000))
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1600 * x ** 2) / SR) * 0.15
    return (out * 0.5 + sweep) * x ** 2


def downsweep():
    d = 0.6
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 3000 * np.exp(-t / 0.12) + 80
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) * 0.2


# ─── Гармония: Am – F – C – G по такту (4 бита) начиная с дропа ─────────
CHORDS = [
    (45, [57, 60, 64]),  # Am
    (41, [53, 57, 60]),  # F
    (48, [55, 60, 64]),  # C
    (43, [55, 59, 62]),  # G
]


def chord_at(beat):
    if beat < CUTS[0]:
        return CHORDS[0]
    return CHORDS[int((beat - CUTS[0]) // 4) % 4]


def supersaw(freqs, dur, voices=5, spread=0.012):
    out = np.zeros(int(dur * SR))
    for f in freqs:
        for v in range(voices):
            det = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
            out += saw(f, dur, det)
    return out / (len(freqs) * voices)


# ─── Сборка дорожек ──────────────────────────────────────────────────────
drums = np.zeros(N)
bass = np.zeros(N)
synth = np.zeros(N)
fx = np.zeros(N)
reverb_send = np.zeros(N)

K, C, HC, HO, TK = kick(), clap(), hat(), hat(True), tick()


def in_break(beat):
    return BREAK[0] <= beat < BREAK[1]


for beat in range(TOTAL_BEATS):
    b = float(beat)
    # ХУК: часы тикают, пульсирующий «сердечный» низ
    if beat < CUTS[0]:
        place(drums, TK, b, 0.9)
        place(drums, TK, b + 0.5, 0.35)
        if beat % 2 == 0:
            place(drums, K * np.exp(-np.arange(len(K)) / SR / 0.12), b, 0.45)
        continue
    if beat >= OUTRO:
        continue

    breakdown = in_break(beat)
    first_half_break = breakdown and beat < BREAK[0] + 6

    # Бочка «четыре на пол»
    if not first_half_break:
        place(drums, K, b, 1.0)
    # Клэп на 2 и 4
    if beat % 2 == 1 and not first_half_break:
        place(drums, C, b, 0.9)
        place(reverb_send, C, b, 0.35)
    # Хэты: закрытые на 16-х, открытый на офф-бите
    for s in range(4):
        vel = [0.5, 0.25, 0.8, 0.3][s]
        if s == 2 and not breakdown:
            place(drums, HO, b + 0.5, 0.55)
        else:
            place(drums, HC, b + s * 0.25, vel * (0.5 if breakdown else 1.0))

    root, tones = chord_at(b)
    # Бас: восьмые, офф-битовый акцент
    if not first_half_break:
        for e8 in range(2):
            d = BEAT / 2 * 0.9
            n = note(root - 12 + (12 if e8 == 1 and beat % 4 == 3 else 0))
            sig = lp(saw(n, d) * 0.6 + np.sin(2 * np.pi * n * np.arange(int(d * SR)) / SR) * 0.8, 900) * env(d, 0.003, 0.18, 0.4, 0.02)
            place(bass, sig, b + e8 * 0.5, 0.55 if e8 == 0 else 0.75)

    # Аккорды: стабы на офф-бит (в брейкдауне — длинный пэд)
    if breakdown:
        if beat % 4 == 0:
            d = 4 * BEAT
            sig = lp(supersaw([note(x) for x in tones], d), 700 + 300 * ((beat - BREAK[0]) / 10)) * env(d, 0.3, 3.0, 0.7, 0.3)
            place(synth, sig, b, 0.7)
            place(reverb_send, sig, b, 0.5)
    else:
        d = BEAT * 0.45
        sig = lp(supersaw([note(x + 12) for x in tones], d), 4200) * env(d, 0.002, 0.12, 0.25, 0.03)
        place(synth, sig, b + 0.5, 0.55)
        place(reverb_send, sig, b + 0.5, 0.3)

    # Арпеджио со сцены «Стили» и дальше
    if beat >= CUTS[2] and not breakdown:
        seq = [tones[0] + 24, tones[1] + 24, tones[2] + 24, tones[1] + 24]
        for s in range(4):
            d = BEAT / 4 * 0.8
            n = note(seq[s])
            tt = np.arange(int(d * SR)) / SR
            sig = (np.sign(np.sin(2 * np.pi * n * tt)) * 0.3 + np.sin(2 * np.pi * n * tt)) * env(d, 0.001, 0.05, 0.0, 0.01)
            place(synth, lp(sig, 5000), b + s * 0.25, 0.18)
            place(reverb_send, sig, b + s * 0.25, 0.08)

    # Лид в Premium и финале
    if beat >= CUTS[6]:
        motif = [12, 7, 3, 7, 12, 14, 15, 14]
        m = motif[(beat - CUTS[6]) % 8]
        d = BEAT * 0.9
        n = note(tones[0] + 12 + m)
        sig = lp(supersaw([n], d, voices=3, spread=0.006), 3500) * env(d, 0.01, 0.35, 0.4, 0.05)
        place(synth, sig, b, 0.35)
        place(reverb_send, sig, b, 0.25)

# Райзеры и дробь перед дропами
for start, length in [(2, 4), (BREAK[1] - 4, 4)]:
    place(fx, riser(length), float(start), 0.9)
    # ускоряющаяся дробь клэпа за последний бит
    for k in range(8):
        place(fx, C, start + length - 1 + k / 8, 0.25 + k * 0.06)

# Удары на каждой склейке: крэш + саб + свист
for cut in CUTS:
    place(fx, crash(), float(cut), 0.8)
    place(fx, boom(), float(cut), 0.9)
    place(fx, downsweep(), float(cut), 1.0)
    place(reverb_send, crash(), float(cut), 0.2)

# Финал: длинный аккорд Am + удар
d = 3 * BEAT + 0.5
fin = supersaw([note(x) for x in [45, 57, 60, 64, 69]], d)
fin = lp(fin, 2500) * env(d, 0.01, 1.2, 0.3, 0.4)
place(synth, fin, float(OUTRO), 0.8)
place(reverb_send, fin, float(OUTRO), 0.6)
place(fx, boom(), float(OUTRO), 0.8)
place(fx, crash(), float(OUTRO), 0.6)

# ─── Сайдчейн: «качание» баса и синтов от бочки ──────────────────────────
duck = np.ones(N)
for beat in range(CUTS[0], OUTRO):
    if in_break(beat) and beat < BREAK[0] + 6:
        continue
    i = bt(beat)
    L = bt(1)
    tt = np.arange(L) / SR
    duck[i : i + L] = np.minimum(duck[i : i + L], 1 - 0.65 * np.exp(-tt / 0.09))

# ─── Реверб (свёртка с шумовым импульсом) ────────────────────────────────
ir_len = int(1.8 * SR)
ir = rng.standard_normal(ir_len) * np.exp(-np.arange(ir_len) / SR / 0.45)
ir = lp(ir, 6000)
ir /= np.sqrt(np.sum(ir ** 2))
wet = fftconvolve(reverb_send, ir)[:N] * 0.35

mix = drums * 0.9 + bass * duck * 0.9 + synth * duck * 0.8 + fx * 0.8 + wet
mix = hp(mix, 25)

# Стерео: чуть разводим синты и реверб
left = mix + 0.08 * (synth * duck) + 0.06 * wet
right = mix - 0.08 * (synth * duck) + 0.06 * np.roll(wet, 331)
stereo = np.stack([left, right], axis=1)

# Мастер: нормализация + мягкий лимитер + фейд в конце
stereo /= np.max(np.abs(stereo)) + 1e-9
stereo = np.tanh(stereo * 1.4) / np.tanh(1.4)
fade = int(0.35 * SR)
stereo[-fade:] *= np.linspace(1, 0, fade)[:, None]
stereo *= 0.89

pcm = (stereo * 32767).astype('<i2').tobytes()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'public', 'music.mp3')
subprocess.run(
    [imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-',
     '-c:a', 'libmp3lame', '-b:a', '192k', out],
    input=pcm,
    check=True,
)
print(f'готово: {out} ({DURATION:.1f} с, {BPM} BPM)')
