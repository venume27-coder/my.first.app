"""Рекламная озвучка ролика → public/voice.mp3 + src/voiceSegments.ts

Голос — нейросетевая модель Piper (ONNX), запускается офлайн через onnxruntime.
Текст переводится в фонемы (piper-phonemize / espeak-ng), затем фонемы
правятся словарём STRESS_FIXES: так исправляются неверные ударения и
произношение, которые автоматический фонемизатор ставит неправильно.
Модель скачивается один раз с GitHub в scripts/.tts-models/.

    pip install onnxruntime piper-phonemize numpy imageio-ffmpeg
    python scripts/make_voiceover.py [голос]          # собрать озвучку
    python scripts/make_voiceover.py --phonemes       # показать фонемы фраз (для проверки ударений)

Голоса: ruslan (мужской, по умолчанию), dmitri, denis (мужские), irina (женский)
"""
import json
import os
import subprocess
import sys
import tarfile
import urllib.request

import imageio_ffmpeg
import numpy as np
import onnxruntime as ort
from piper_phonemize import phonemize_espeak

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000
FPS = 30
BEAT = 0.5  # 120 BPM
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
VOICE = ARGS[0] if ARGS else 'ruslan'
SHOW_PHONEMES = '--phonemes' in sys.argv

# Параметры модели: меньше шум → ровнее и естественнее интонация, без «акцента»
LENGTH_SCALE = 0.93  # < 1 — чуть быстрее
NOISE_SCALE = 0.45
NOISE_W = 0.5
SENTENCE_PAUSE = 0.12  # с

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MODELS = os.path.join(HERE, '.tts-models')
URL = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-{v}-medium.tar.bz2'

# Сцены в битах — как SCENE_BEATS в src/config.ts
SCENES = [6, 8, 14, 12, 12, 12, 10, 14, 16]
STARTS = np.concatenate([[0], np.cumsum(SCENES)[:-1]]) * BEAT
TOTAL = sum(SCENES) * BEAT
OUTRO = (sum(SCENES) - 3) * BEAT

# (начало, секунд; максимальная длина слота; текст)
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

# Исправления фонем: (что выдал фонемизатор, как правильно).
# ˈ — ударение перед ударным слогом.
STRESS_FIXES = [
    ('tʲiɭʲˈeɡrʌmʲi', 'tʲiɭʲiɡrˈɑmʲi'),  # Телегра́ме (не «Теле́граме»)
    ('tʲiɭʲˈeɡrʌm', 'tʲiɭʲiɡrˈɑm'),  # Телегра́м
    ('pˈot tvˈoj', 'pʌt tvˈoj'),  # «под» безударное
    ('prʲiʑintˈɑtsy', 'prʲizʲintˈɑtsy'),  # презента́ция: «з», а не «ж»
    ('"', ''),  # мусорный символ фонемизатора («плюс», «включается»)
    ('ˌɪɭʲɪ', 'ɪɭʲɪ'),  # «или» без лишнего побочного ударения
    ('nˈova bˈot', 'nˈovʌ bˈot'),  # Но́ва Бот — редуцированное «а»
    ('bʲˈiʑnɛs', 'bʲˈiznʲɪs'),  # би́знес: «з», а не «ж»
    ('ˈɪmʲidʃ', 'ˈimʲitʃ'),  # и́мидж
]

# Мягкая обработка: чистый, тёплый, разборчивый голос
CHAIN = ','.join([
    'highpass=f=70',
    'equalizer=f=250:t=q:w=1.2:g=-1.5',
    'equalizer=f=2800:t=q:w=1:g=2',
    'equalizer=f=7000:t=q:w=1:g=-1.5',
    'acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=3',
    'alimiter=limit=0.95',
])


def model_paths(voice):
    d = os.path.join(MODELS, f'vits-piper-ru_RU-{voice}-medium')
    if not os.path.isdir(d):
        os.makedirs(MODELS, exist_ok=True)
        archive = d + '.tar.bz2'
        print('скачиваю модель голоса', voice, '…')
        urllib.request.urlretrieve(URL.format(v=voice), archive)
        with tarfile.open(archive) as t:
            t.extractall(MODELS)
        os.remove(archive)
    return os.path.join(d, f'ru_RU-{voice}-medium.onnx'), os.path.join(d, f'ru_RU-{voice}-medium.onnx.json')


def phonemes(text):
    """Фонемы по предложениям, с применёнными исправлениями ударений."""
    out = []
    for sent in phonemize_espeak(text, 'ru'):
        s = ''.join(sent)
        for wrong, right in STRESS_FIXES:
            s = s.replace(wrong, right)
        out.append(s)
    return out


class Piper:
    def __init__(self, voice):
        onnx, cfg = model_paths(voice)
        conf = json.load(open(cfg, encoding='utf-8'))
        self.sr = conf['audio']['sample_rate']
        self.ids = conf['phoneme_id_map']
        self.sess = ort.InferenceSession(onnx, providers=['CPUExecutionProvider'])

    def to_ids(self, ph):
        ids = list(self.ids['^']) + list(self.ids['_'])
        for c in ph:
            if c in self.ids:
                ids += self.ids[c] + self.ids['_']
        return ids + list(self.ids['$'])

    def speak(self, text):
        parts = []
        for ph in phonemes(text):
            ids = np.array([self.to_ids(ph)], dtype=np.int64)
            audio = self.sess.run(None, {
                'input': ids,
                'input_lengths': np.array([ids.shape[1]], dtype=np.int64),
                'scales': np.array([NOISE_SCALE, LENGTH_SCALE, NOISE_W], dtype=np.float32),
            })[0].squeeze()
            parts += [audio.astype(np.float32), np.zeros(int(SENTENCE_PAUSE * self.sr), np.float32)]
        return np.concatenate(parts[:-1])


def process(samples, sr, tempo):
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


if SHOW_PHONEMES:
    for _, _, text in LINES:
        print(text, '\n   ', ' | '.join(phonemes(text)))
    sys.exit()

tts = Piper(VOICE)
track = np.zeros(int((TOTAL + 1) * SR), np.float32)
segments = []
for start, slot, text in LINES:
    raw = trim_silence(tts.speak(text), tts.sr)
    raw /= max(np.max(np.abs(raw)), 1e-6) / 0.9
    dur = len(raw) / tts.sr
    tempo = min(1.3, max(1.0, dur / slot))
    clip = trim_silence(process(raw, tts.sr, tempo), SR)
    a = int(start * SR)
    b = min(len(track), a + len(clip))
    track[a:b] += clip[: b - a]
    end = start + (b - a) / SR
    segments.append((round(start * FPS), round(end * FPS)))
    print(f'{start:5.2f}–{end:5.2f} с  (слот {slot:.1f} с, x{tempo:.2f})  {text}')

track = track[: int(TOTAL * SR)]
track *= 0.95 / (np.max(np.abs(track)) + 1e-9)

out = os.path.join(ROOT, 'public', 'voice.mp3')
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
