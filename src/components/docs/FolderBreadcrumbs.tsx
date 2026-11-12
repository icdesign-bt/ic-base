import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from 'ic-kit';
import { folderBreadcrumbTrail } from '@/lib/corpus';

type Props = {
  folderId: string;
};

export function FolderBreadcrumbs({ folderId }: Props) {
  const navigate = useNavigate();
  const trail = folderBreadcrumbTrail(folderId);
  if (trail.length === 0) return null;

  return (
    <Breadcrumbs
      className="kb-folder-breadcrumbs"
      items={trail.map((item, index) => {
        const current = index === trail.length - 1 || !item.to;
        return {
          label: item.label,
          current,
          onClick: current
            ? undefined
            : () => {
                navigate(item.to!);
              },
        };
      })}
    />
  );
}
