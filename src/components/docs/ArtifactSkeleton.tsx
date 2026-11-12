import { Skeleton } from 'ic-kit';

const SKELETON_COUNT = 7;

/** Плейсхолдеры карточек файлов (md), пока ассистент думает. */
export function ArtifactSkeleton({ count = SKELETON_COUNT }: { count?: number }) {
  return (
    <div className="kb-assistant__artifacts-list" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="kb-file-preview-card kb-file-preview-card--md kb-file-preview-card--skeleton"
        >
          <span className="kb-file-preview-card__media kb-file-preview-card__media--skel">
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="pulse"
              className="kb-file-preview-card__skel-preview"
            />
          </span>
          <span className="kb-file-preview-card__body">
            <Skeleton variant="circular" width={16} height={16} animation="pulse" />
            <span className="kb-file-card__text kb-file-preview-card__skel-text">
              <Skeleton variant="text" width="92%" height={12} animation="pulse" />
              <Skeleton variant="text" width="48%" height={10} animation="pulse" />
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
