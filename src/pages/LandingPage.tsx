import { Text } from 'ic-kit';
import { LandingSearch } from '@/components/home/LandingSearch';

export function LandingPage() {
  return (
    <div className="kb-landing">
      <div className="kb-landing__center">
        <Text as="h1" variant="heading-h4" className="kb-landing__title">
          Добро пожаловать в Ядро — новую Базу знаний ИЦ.{' '}
          <span className="kb-landing__title-accent">Что ищем?</span>
        </Text>
        <LandingSearch />
      </div>
    </div>
  );
}
