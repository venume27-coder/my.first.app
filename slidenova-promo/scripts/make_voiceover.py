"""Рекламная озвучка ролика → public/voice.mp3 + src/voiceSegments.ts

Голос синтезируется офлайн нейросетевой моделью Piper (через sherpa-onnx).
Модель скачивается один раз с GitHub в scripts/.tts-models/. Затем голос
мягко обрабатывается: лёгкий эквалайзер, компрессия, нормализация громкости.
Каждая фраза ставится на свою сцену (время — в битах, как в src/config.ts),
а если не помещается в слот — чуть ускоряется.

    pip install sherpa-onnx numpy imageio-ffmpeg
    python scripts/make_voiceover.py [голос]

Голоса: ruslan (мужской, по умолчанию), dmitri (мужской), denis (мужской), irina (женский)
"""
import glob
import os
import subprocess
import sys
import tarfile
import tempfile
import urllib.request

import imageio_ffmpeg
import numpy as np
import sherpa_onnx

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
FPS = 30
BEAT = 0.5  # 120 BPM
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'ruslan'
SPEED = 1.08  # чуть бодрее обычной речи

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MODELS = os.path.join(HERE, '.tts-models')
URL = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-{v}-medium.tar.bz2'

# Сцены в битах — как SCENE_BEATS в src/config.ts
SCENES = [6, 8, 14, 12, 12, 12, 10, 14, 16]
STARTS = np.concatenate([[0], np.cumsum(SCENES)[:-1]]) * BEAT
TOTAL = sum(SCENES) * BEAT
OUTRO = (sum(SCENES) - 3) * BEAT

# (начало, секунд; максимальная длина слота; текст). Имена — фонетически.
LINES = [
    (STARTS[0] + 0.15, 2.7, 'Презентация к завтра? А слайдов — ноль?'),
    (STARTS[1] + 0.25, 3.6, 'Спокойно! Есть решение. Слайд Нова Бот!'),
    (STARTS[2] + 0.4, 6.4, 'Просто напиши тему — и нейросеть соберёт готовую презентацию. За минуту!'),
    (STARTS[3] + 0.3, 5.6, 'Выбирай стиль: бизнес, стартап, образовательный или социальный!'),
    (STARTS[4] + 0.3, 5.6, 'Свой шрифт, своя палитра, и твой логотип — прямо на слайдах!'),
    (STARTS[5] + 0.3, 5.6, 'Команда слэш имидж — и нейросеть рисует картинку. Плюс фото и стильные фоны!'),
    (STARTS[6] + 0.3, 4.6, 'Переходы? Фейд, пуш, зум — под твой стиль!'),
    (STARTS[7] + 0.3, 6.6, 'Хочешь больше? Премиум! Оплата через Клик — и всё включается сразу.'),
    (STARTS[8] + 0.2, 6.0, 'Презентация за минуту! Открывай Слайд Нова Бот в Телеграме — прямо сейчас!'),
    (OUTRO + 0.15, 1.3, 'Слайд Нова Бот!'),
]

# Мягкая обработка: чистый, тёплый, разборчивый голос
CHAIN = ','.join([
    'highpass=f=70',
    'equalizer=f=250:t=q:w=1.2:g=-1.5',  # убрать «бубнёж»
    'equalizer=f=2800:t=q:w=1:g=2',  # разборчивость
    'equalizer=f=7000:t=q:w=1:g=-1.5',  # смягчить сибилянты
    'acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=3',
    'alimiter=limit=0.95',
])


def model_dir(voice):
    d = os.path.join(MODELS, f'vits-piper-ru_RU-{voice}-medium')
    if not os.path.isdir(d):
        os.makedirs(MODELS, exist_ok=True)
        archive = d + '.tar.bz2'
        print('скачиваю модель голоса', voice, '…')
        urllib.request.urlretrieve(URL.format(v=voice), archive)
        with tarfile.open(archive) as t:
            t.extractall(MODELS)
        os.remove(archive)
    return d


def make_tts(voice):
    d = model_dir(voice)
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=glob.glob(os.path.join(d, '*.onnx'))[0],
                tokens=os.path.join(d, 'tokens.txt'),
                data_dir=os.path.join(d, 'espeak-ng-data'),
            ),
            num_threads=4,
        )
    )
    return sherpa_onnx.OfflineTts(cfg)


def process(samples, sr, tempo):
    """Ресемплинг, темп и обработка через ffmpeg."""
    pcm = (np.clip(samples, -1, 1) * 32767).astype('<i2').tobytes()
    raw = subprocess.run(
        [FF, '-loglevel', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-',
         '-af', f'atempo={tempo:.3f},{CHAIN}', '-ar', str(SR), '-ac', '1', '-f', 's16le', '-'],
        input=pcm, capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').astype(np.float32) / 32768


def trim_silence(x, sr, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    return x[max(0, idx[0] - int(0.02 * sr)): min(len(x), idx[-1] + int(0.1 * sr))]


tts = make_tts(VOICE)
track = np.zeros(int((TOTAL + 1) * SR), np.float32)
segments = []
for start, slot, text in LINES:
    audio = tts.generate(text, sid=0, speed=SPEED)
    raw = trim_silence(np.array(audio.samples, np.float32), audio.sample_rate)
    dur = len(raw) / audio.sample_rate
    tempo = min(1.3, max(1.0, dur / slot))
    clip = trim_silence(process(raw, audio.sample_rate, tempo), SR)
    a = int(start * SR)
    b = min(len(track), a + len(clip))
    track[a:b] += clip[: b - a]
    end = start + (b - a) / SR
    segments.append((round(start * FPS), round(end * FPS)))
    print(f'{start:5.2f}–{end:5.2f} с  (слот {slot:.1f} с, x{tempo:.2f})  {text}')

track = track[: int(TOTAL * SR)]
track *= 0.95 / (np.max(np.abs(track)) + 1e-9)

out = os.path.join(ROOT, 'public', 'voice.mp3')
with tempfile.TemporaryDirectory():
    subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-',
                    '-af', 'loudnorm=I=-15:TP=-1.5:LRA=9', '-ar', str(SR), '-c:a', 'libmp3lame', '-b:a', '192k', out],
                   input=(track * 32767).astype('<i2').tobytes(), check=True)

ts = os.path.join(ROOT, 'src', 'voiceSegments.ts')
with open(ts, 'w', encoding='utf-8') as f:
    f.write('// Сгенерировано scripts/make_voiceover.py — интервалы фраз озвучки в кадрах.\n')
    f.write('// По ним музыка приглушается, пока звучит голос.\n')
    f.write('export const VOICE_SEGMENTS: [number, number][] = [\n')
    for s, e in segments:
        f.write(f'  [{s}, {e}],\n')
    f.write('];\n')
print('готово:', out, 'голос:', VOICE)
