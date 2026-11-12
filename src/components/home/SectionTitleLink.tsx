import { Link } from 'react-router-dom';
import { Icon, Text } from 'ic-kit';

type Props = {
  title: string;
  to: string;
};

/** Заголовок раздела со шевроном — переход вместо «Показать все». */
export function SectionTitleLink({ title, to }: Props) {
  return (
    <div className="kb-section__head">
      <Link to={to} className="kb-section__title-link">
        <Text as="h2" variant="subtitle-md-bold" className="kb-section__title">
          {title}
        </Text>
        <Icon
          path="Arrows & Directions/CaretRight"
          size={18}
          weight="bold"
          className="kb-section__chevron"
          aria-hidden
        />
        <span className="visually-hidden"> — показать все</span>
      </Link>
    </div>
  );
}
