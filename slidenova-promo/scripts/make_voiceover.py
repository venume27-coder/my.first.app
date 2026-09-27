"""Рекламная озвучка ролика → public/voice.mp3 + src/voiceSegments.ts

Голос синтезируется офлайн движком RHVoice (русские голоса), затем
обрабатывается «под рекламу»: эквалайзер на разборчивость, плотная
компрессия, лёгкое насыщение, нормализация громкости. Каждая фраза
ставится на свою сцену (время — в битах, как в src/config.ts), а если
не помещается в слот — чуть ускоряется.

Установка (Ubuntu/Debian):  sudo apt install rhvoice rhvoice-russian
                            pip install numpy imageio-ffmpeg
Запуск:                     python scripts/make_voiceover.py [голос]
Голоса (мужские): aleksandr-hq, artemiy, mikhail, pavel, yuriy, vitaliy, evgeniy-rus
"""
import os
import subprocess
import sys
import tempfile

import imageio_ffmpeg
import numpy as np

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
FPS = 30
BEAT = 0.5  # 120 BPM
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'aleksandr-hq'
RATE = 135  # % скорости речи — энергичная подача
PITCH = 104  # % высоты

# Сцены в битах — как SCENE_BEATS в src/config.ts
SCENES = [6, 8, 14, 12, 12, 12, 10, 14, 16]
STARTS = np.concatenate([[0], np.cumsum(SCENES)[:-1]]) * BEAT
TOTAL = sum(SCENES) * BEAT
OUTRO = (sum(SCENES) - 3) * BEAT

# (начало, секунд; максимальная длина слота; текст). Имена — фонетически.
LINES = [
    (STARTS[0] + 0.15, 2.7, 'Презентация к завтра?! А слайдов — ноль?!'),
    (STARTS[1] + 0.25, 3.6, 'Спокойно! Есть решение. Слайд Нова Бот!'),
    (STARTS[2] + 0.4, 6.4, 'Просто напиши тему — и нейросеть соберёт готовую презентацию. За минуту!'),
    (STARTS[3] + 0.3, 5.6, 'Выбирай стиль: бизнес, стартап, образовательный или социальный!'),
    (STARTS[4] + 0.3, 5.6, 'Свой шрифт! Своя палитра! И твой логотип — прямо на слайдах!'),
    (STARTS[5] + 0.3, 5.6, 'Команда слэш имидж — и нейросеть рисует картинку! Плюс фото и стильные фоны!'),
    (STARTS[6] + 0.3, 4.6, 'Переходы? Фейд, пуш, зум — под твой стиль!'),
    (STARTS[7] + 0.3, 6.6, 'Хочешь мощнее? Премиум! Оплата через Клик — и всё включается сразу!'),
    (STARTS[8] + 0.2, 6.0, 'Презентация за минуту! Жми — Слайд Нова Бот в Телеграме. Прямо сейчас!'),
    (OUTRO + 0.15, 1.3, 'Слайд Нова Бот!'),
]

# Обработка «рекламный диктор»
CHAIN = ','.join([
    'highpass=f=85',
    'equalizer=f=180:t=q:w=1:g=2.5',  # плотность
    'equalizer=f=450:t=q:w=1.2:g=-2.5',  # убрать «коробку»
    'equalizer=f=3200:t=q:w=1:g=4',  # напор и разборчивость
    'equalizer=f=9000:t=q:w=1:g=2',  # воздух
    'acompressor=threshold=-24dB:ratio=5:attack=4:release=90:makeup=6',
    'asoftclip=type=tanh:threshold=0.9',
    'alimiter=limit=0.9',
])


def synth(text, path):
    subprocess.run(['RHVoice-test', '-p', VOICE, '-r', str(RATE), '-t', str(PITCH), '-R', str(SR), '-o', path],
                   input=text.encode('utf-8'), check=True)


def load(path, filters):
    raw = subprocess.run([FF, '-loglevel', 'error', '-i', path, '-af', filters, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').astype(np.float32) / 32768


def trim_silence(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.02 * SR))
    b = min(len(x), idx[-1] + int(0.08 * SR))
    return x[a:b]


track = np.zeros(int((TOTAL + 1) * SR), np.float32)
segments = []
with tempfile.TemporaryDirectory() as tmp:
    for i, (start, slot, text) in enumerate(LINES):
        wav = os.path.join(tmp, f'{i}.wav')
        synth(text, wav)
        dur = len(trim_silence(load(wav, 'anull'))) / SR
        tempo = min(1.3, max(1.0, dur / slot))
        clip = trim_silence(load(wav, f'atempo={tempo:.3f},{CHAIN}'))
        a = int(start * SR)
        b = min(len(track), a + len(clip))
        track[a:b] += clip[: b - a]
        end = start + (b - a) / SR
        segments.append((round(start * FPS), round(end * FPS)))
        print(f'{start:5.2f}–{end:5.2f} с  (слот {slot:.1f} с, x{tempo:.2f})  {text}')

track = track[: int(TOTAL * SR)]
track *= 0.95 / (np.max(np.abs(track)) + 1e-9)

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'public', 'voice.mp3')
subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-',
                '-af', 'loudnorm=I=-14:TP=-1.5:LRA=7', '-ar', str(SR), '-c:a', 'libmp3lame', '-b:a', '192k', out],
               input=(track * 32767).astype('<i2').tobytes(), check=True)

ts = os.path.join(root, 'src', 'voiceSegments.ts')
with open(ts, 'w', encoding='utf-8') as f:
    f.write('// Сгенерировано scripts/make_voiceover.py — интервалы фраз озвучки в кадрах.\n')
    f.write('// По ним музыка приглушается, пока звучит голос.\n')
    f.write('export const VOICE_SEGMENTS: [number, number][] = [\n')
    for s, e in segments:
        f.write(f'  [{s}, {e}],\n')
    f.write('];\n')
print('готово:', out, 'голос:', VOICE)
