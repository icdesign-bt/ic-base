import { useMemo } from 'react';
import { Text } from 'ic-kit';
import { FrequentPreview } from '@/components/home/FrequentPreview';
import { KbSearchBar } from '@/components/home/KbSearchBar';
import { frequentItemsForRole } from '@/lib/corpus';
import { useApp } from '@/state/AppContext';

export function LandingSearch() {
  const { role } = useApp();
  const frequent = useMemo(() => frequentItemsForRole(role), [role]);

  return (
    <div className="kb-landing-search-wrap">
      <KbSearchBar />

      <section className="kb-landing-search__frequent" aria-label="Часто используемые">
        <Text as="h2" variant="subtitle-md-bold">
          Часто используемые
        </Text>
        <FrequentPreview items={frequent} />
      </section>
    </div>
  );
}
