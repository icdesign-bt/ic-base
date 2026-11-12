import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, Icon, IconButton, Text } from 'ic-kit';
import { FavoriteStar } from '@/components/docs/FavoriteStar';
import { FileTypeGlyph } from '@/components/docs/FileTypeGlyph';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { DocumentViewer } from '@/components/preview/PreviewViewers';
import { getDocumentAttribution, getDocumentPreviewFacts } from '@/lib/documentMeta';
import { formatDocDate } from '@/lib/format';
import { useApp } from '@/state/AppContext';

const CLOSE_MS = 500;
const STEP_MS = 160;

type SlidePhase =
  | 'idle'
  | 'exit-left'
  | 'exit-right'
  | 'enter-left'
  | 'enter-right'
  | 'settle';

export function PreviewDrawer() {
  const {
    previewDoc,
    previewQueue,
    stepPreview,
    closePreview,
    isDocFavorite,
    toggleDocFavorite,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState<SlidePhase>('idle');
  const titleId = useId();
  const closeTimer = useRef<number | null>(null);
  const stepTimer = useRef<number | null>(null);
  const hasOpened = useRef(false);
  const stepping = useRef(false);

  const requestClose = useCallback(() => {
    if (stepping.current) return;
    setOpen(false);
    setSlide('idle');
    hasOpened.current = false;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      closePreview();
      closeTimer.current = null;
    }, CLOSE_MS);
  }, [closePreview]);

  useEffect(() => {
    if (!previewDoc) {
      setOpen(false);
      setSlide('idle');
      hasOpened.current = false;
      stepping.current = false;
      return;
    }
    if (hasOpened.current) return;
    const frame = window.requestAnimationFrame(() => {
      setOpen(true);
      hasOpened.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [previewDoc]);

  const queueIndex = useMemo(() => {
    if (!previewDoc) return -1;
    return previewQueue.findIndex((item) => item.id === previewDoc.id);
  }, [previewDoc, previewQueue]);

  const canStep = previewQueue.length > 1;
  const canPrev = canStep && queueIndex > 0;
  const canNext = canStep && queueIndex >= 0 && queueIndex < previewQueue.length - 1;
  const slideBusy = slide !== 'idle';

  const requestStep = useCallback(
    (delta: -1 | 1) => {
      if (stepping.current || !open) return;
      if (delta < 0 && !canPrev) return;
      if (delta > 0 && !canNext) return;

      stepping.current = true;
      setSlide(delta > 0 ? 'exit-left' : 'exit-right');

      if (stepTimer.current) window.clearTimeout(stepTimer.current);
      stepTimer.current = window.setTimeout(() => {
        stepPreview(delta);
        setSlide(delta > 0 ? 'enter-right' : 'enter-left');

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setSlide('settle');
            stepTimer.current = window.setTimeout(() => {
              setSlide('idle');
              stepping.current = false;
              stepTimer.current = null;
            }, STEP_MS);
          });
        });
      }, STEP_MS);
    },
    [open, canPrev, canNext, stepPreview],
  );

  useEffect(() => {
    if (!previewDoc) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        requestStep(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        requestStep(1);
      }
    };
    window.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('kb-preview-lock');

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.documentElement.classList.remove('kb-preview-lock');
    };
  }, [previewDoc, requestClose, requestStep]);

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      if (stepTimer.current) window.clearTimeout(stepTimer.current);
    },
    [],
  );

  if (!previewDoc) return null;

  const fav = isDocFavorite(previewDoc.id);
  const meta = getDocumentAttribution(previewDoc);
  const author = meta.createdBy;
  const facts = getDocumentPreviewFacts(previewDoc);
  const slideClass = slide === 'idle' ? '' : ` is-slide-${slide}`;

  return (
    <div
      className={`kb-preview-root${open ? ' is-open' : ''}${canStep ? ' has-steps' : ''}`}
      role="presentation"
    >
      <button
        type="button"
        className="kb-preview-scrim"
        aria-label="Закрыть превью"
        onClick={requestClose}
      />

      {canStep ? (
        <IconButton
          className="kb-preview-step kb-preview-step--prev"
          aria-label="Предыдущий файл"
          size="lg"
          variant="tonal"
          color="neutral"
          disabled={!canPrev || slideBusy}
          icon={<Icon path="Arrows & Directions/CaretLeft" size={22} weight="bold" />}
          onClick={() => requestStep(-1)}
        />
      ) : null}

      <div
        className={`kb-preview${slideClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="kb-preview__head">
          <div className="kb-preview__head-main">
            <FileTypeGlyph fileType={previewDoc.fileType} className="kb-preview__file-glyph" />
            <div className="kb-preview__head-copy">
              <Text as="h2" id={titleId} variant="subtitle-xlg-bold" className="kb-preview__title">
                {previewDoc.title}
              </Text>
              <Text as="p" variant="body-sm" color="secondary" className="kb-preview__facts">
                {facts}
                {canStep ? (
                  <span className="kb-preview__facts-pos">
                    {' '}
                    · {queueIndex + 1} из {previewQueue.length}
                  </span>
                ) : null}
              </Text>
            </div>
          </div>
          <div className="kb-preview__head-actions">
            <FavoriteStar
              active={fav}
              label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
              onToggle={() => toggleDocFavorite(previewDoc.id)}
            />
            <Button
              size="md"
              variant="contained"
              color="primary"
              startIcon={<Icon path="System Devices/DownloadSimple" size={18} weight="regular" />}
              onClick={() => window.alert('Мок: скачивание недоступно в образе')}
            >
              Скачать
            </Button>
            <Button
              size="md"
              variant="tonal"
              color="primary"
              startIcon={
                <Icon path="Arrows & Directions/ArrowSquareOut" size={18} weight="regular" />
              }
              onClick={() => window.alert('Мок: полное открытие — в следующем контуре')}
            >
              Открыть
            </Button>
            <Button
              size="md"
              variant="outlined"
              color="neutral"
              startIcon={<Icon path="System Devices/GearSix" size={18} weight="regular" />}
              onClick={() => window.alert('Мок: настройки доступа')}
            >
              Настройки доступа
            </Button>
            <IconButton
              aria-label="Закрыть"
              size="md"
              variant="text"
              color="neutral"
              icon={<Icon path="Math & Finances/X" size={18} weight="regular" />}
              onClick={requestClose}
            />
          </div>
        </header>

        <div className="kb-preview__stage">
          <DocumentViewer key={previewDoc.id} doc={previewDoc} />
        </div>

        <footer className="kb-preview__foot">
          <div className="kb-preview__meta">
            {author ? (
              <div className="kb-preview__meta-person">
                <PersonAvatar person={author} size="sm" />
                <div className="kb-preview__meta-text">
                  <Text as="p" variant="label-sm-bold" className="kb-preview__meta-label">
                    Создал
                  </Text>
                  <Text as="p" variant="body-sm">
                    {author.name}
                    <span className="kb-preview__meta-muted"> · {author.roleLabel}</span>
                  </Text>
                </div>
              </div>
            ) : null}
            <div className="kb-preview__meta-text">
              <Text as="p" variant="label-sm-bold" className="kb-preview__meta-label">
                Загрузил
              </Text>
              <Text as="p" variant="body-sm">
                {formatDocDate(meta.uploadedAt)}
              </Text>
            </div>
            {meta.wasUpdated ? (
              <div className="kb-preview__meta-text">
                <Text as="p" variant="label-sm-bold" className="kb-preview__meta-label">
                  Обновил
                </Text>
                <Text as="p" variant="body-sm">
                  {formatDocDate(meta.updatedAt)}
                </Text>
              </div>
            ) : null}
          </div>
        </footer>
      </div>

      {canStep ? (
        <IconButton
          className="kb-preview-step kb-preview-step--next"
          aria-label="Следующий файл"
          size="lg"
          variant="tonal"
          color="neutral"
          disabled={!canNext || slideBusy}
          icon={<Icon path="Arrows & Directions/CaretRight" size={22} weight="bold" />}
          onClick={() => requestStep(1)}
        />
      ) : null}
    </div>
  );
}
