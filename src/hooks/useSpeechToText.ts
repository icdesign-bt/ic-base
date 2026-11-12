import { useCallback, useEffect, useRef, useState } from 'react';
import {
  playMicEndChime,
  playMicStartChime,
  unlockMicChimes,
} from '@/lib/micChimes';

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: Event & { error?: string }) => void) | null;
  onresult: ((ev: SpeechRecognitionResultEventLike) => void) | null;
};

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speechUnavailableReason(): string | null {
  if (typeof window === 'undefined') return 'Голосовой ввод недоступен.';
  // Safari/iOS отдаёт SpeechRecognition только в secure context.
  // http://192.168.* — не secure → API отсутствует (как «браузер не умеет»).
  if (!window.isSecureContext) {
    return 'Голосовой ввод работает только по HTTPS. Откройте страницу по https://… (не http://) и примите сертификат.';
  }
  if (!getSpeechRecognitionCtor()) {
    return 'Голосовой ввод недоступен в этом браузере. На iPhone нужен Safari по HTTPS; на десктопе — Chrome или Edge.';
  }
  return null;
}

export type UseSpeechToTextOptions = {
  lang?: string;
  /** Промежуточный текст (пока говорит). */
  onInterim?: (text: string) => void;
  /** Финальная фраза. */
  onFinal?: (text: string) => void;
  /** Краткое сообщение об ошибке / неподдержке. */
  onError?: (message: string) => void;
};

export type UseSpeechToTextResult = {
  supported: boolean;
  listening: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
};

/**
 * Голосовой ввод через Web Speech API (Chrome / Edge / Safari iOS).
 * Нужен secure context (HTTPS или localhost). Без бэкенда; для демо-прототипа.
 */
export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextResult {
  const { lang = 'ru-RU', onInterim, onFinal, onError } = options;
  const [listening, setListening] = useState(false);
  const supported =
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    getSpeechRecognitionCtor() !== null;

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onInterimRef = useRef(onInterim);
  const onFinalRef = useRef(onFinal);
  const onErrorRef = useRef(onError);
  const intentionalStopRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const endChimePlayedRef = useRef(false);

  useEffect(() => {
    onInterimRef.current = onInterim;
    onFinalRef.current = onFinal;
    onErrorRef.current = onError;
  }, [onInterim, onFinal, onError]);

  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const unavailable = speechUnavailableReason();
    const Ctor = getSpeechRecognitionCtor();
    if (unavailable || !Ctor) {
      onErrorRef.current?.(unavailable ?? 'Голосовой ввод недоступен.');
      return;
    }

    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }

    intentionalStopRef.current = false;
    sessionStartedRef.current = false;
    endChimePlayedRef.current = false;
    // Новый инстанс на каждый старт — на iOS 27 повторное использование часто «молчит».
    const rec = new Ctor();
    rec.lang = lang;
    // На Safari iOS continuous=true часто не отдаёт финальный текст.
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      sessionStartedRef.current = true;
      setListening(true);
      playMicStartChime();
    };

    rec.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]!;
        const piece = result[0]?.transcript ?? '';
        if (result.isFinal) finalText += piece;
        else interim += piece;
      }
      if (interim) onInterimRef.current?.(interim.trim());
      if (finalText.trim()) onFinalRef.current?.(finalText.trim());
    };

    rec.onerror = (event) => {
      setListening(false);
      const code = event.error ?? '';
      if (code === 'aborted' || code === 'no-speech') return;
      if (code === 'not-allowed') {
        onErrorRef.current?.('Нет доступа к микрофону. Разрешите его в настройках браузера.');
        return;
      }
      onErrorRef.current?.('Не удалось распознать речь. Попробуйте ещё раз.');
    };

    rec.onend = () => {
      setListening(false);
      if (sessionStartedRef.current && !endChimePlayedRef.current) {
        endChimePlayedRef.current = true;
        playMicEndChime();
      }
      recRef.current = null;
    };

    recRef.current = rec;
    // unlock — fire-and-forget; start() должен остаться в жесте клика (Safari).
    void unlockMicChimes();
    try {
      rec.start();
    } catch {
      setListening(false);
      onErrorRef.current?.('Не удалось запустить микрофон. Попробуйте ещё раз.');
    }
  }, [lang]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, start, stop, toggle };
}
