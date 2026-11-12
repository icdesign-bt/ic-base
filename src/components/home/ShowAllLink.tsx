import { useNavigate } from 'react-router-dom';
import { Button } from 'ic-kit';

type Props = {
  to: string;
  className?: string;
};

export function ShowAllLink({ to, className }: Props) {
  const navigate = useNavigate();
  return (
    <Button
      className={['kb-show-all', className].filter(Boolean).join(' ')}
      size="sm"
      color="neutral"
      variant="text"
      onClick={() => navigate(to)}
    >
      Показать все
    </Button>
  );
}
