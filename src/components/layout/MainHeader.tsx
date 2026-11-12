import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { KbLogo } from '@/components/brand/KbLogo';
import { HeaderOverflow } from '@/components/layout/HeaderOverflow';
import { HeaderSettings } from '@/components/layout/HeaderSettings';
import { MainNav } from '@/components/layout/MainNav';
import { NotificationsBell } from '@/components/layout/NotificationsBell';

export type HeaderMode = 'full' | 'compact' | 'stacked';

const EXPAND_SLACK = 16;
const ACTIONS_FALLBACK = 152;

/** Roomier mode wins. Expanding back needs a few spare pixels so the header does not flicker. */
export function pickHeaderMode(
  available: number,
  needFull: number,
  needCompact: number,
  prev: HeaderMode,
): HeaderMode {
  const fits = (need: number) => need <= available + 1;
  const roomy = (need: number) => available - need >= EXPAND_SLACK;

  if (prev === 'full') {
    if (fits(needFull)) return 'full';
    if (fits(needCompact)) return 'compact';
    return 'stacked';
  }
  if (prev === 'compact') {
    if (roomy(needFull)) return 'full';
    if (fits(needCompact)) return 'compact';
    return 'stacked';
  }
  if (roomy(needFull)) return 'full';
  if (roomy(needCompact)) return 'compact';
  return 'stacked';
}

function borderBox(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const border =
    (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.borderRightWidth) || 0);
  return el.scrollWidth + border;
}

export function MainHeader() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mode, setMode] = useState<HeaderMode>('full');
  const headerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const actionsWidthRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const measure = () => {
      const brand = brandRef.current;
      const nav = navRef.current;
      const word = wordRef.current;
      const burger = burgerRef.current;
      const mark = brand?.querySelector<HTMLElement>('.kb-logo__mark');
      const logo = brand?.querySelector<HTMLElement>('.kb-logo');
      if (!brand || !nav || !word || !burger || !mark || !logo) return;
      if (nav.scrollWidth === 0 || word.offsetWidth === 0) return;

      const actionsEl = actionsRef.current;
      if (actionsEl && actionsEl.offsetWidth > 0) actionsWidthRef.current = actionsEl.offsetWidth;

      const headerStyle = getComputedStyle(header);
      const available =
        header.clientWidth -
        (parseFloat(headerStyle.paddingLeft) || 0) -
        (parseFloat(headerStyle.paddingRight) || 0);
      const gap = parseFloat(headerStyle.columnGap || headerStyle.gap) || 0;

      const brandStyle = getComputedStyle(brand);
      const brandChrome =
        (parseFloat(brandStyle.paddingLeft) || 0) +
        (parseFloat(brandStyle.paddingRight) || 0) +
        (parseFloat(brandStyle.borderLeftWidth) || 0) +
        (parseFloat(brandStyle.borderRightWidth) || 0) +
        (parseFloat(brandStyle.marginLeft) || 0) +
        (parseFloat(brandStyle.marginRight) || 0);
      const logoGap = parseFloat(getComputedStyle(logo).columnGap) || 0;
      const markWidth = mark.getBoundingClientRect().width;
      const logoMark = brandChrome + markWidth;
      const logoFull = logoMark + logoGap + word.offsetWidth;
      const actionsWidth = actionsWidthRef.current || ACTIONS_FALLBACK;
      const burgerWidth = burger.offsetWidth || 48;
      const navWidth = borderBox(nav);
      const rowGaps = gap * 2;

      const next = pickHeaderMode(
        available,
        logoFull + navWidth + actionsWidth + rowGaps,
        logoMark + navWidth + burgerWidth + rowGaps,
        modeRef.current,
      );
      setMode((prev) => (prev === next ? prev : next));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [mode, pathname]);

  useLayoutEffect(() => {
    const roots: Array<HTMLElement | Window> = [];
    const main = document.querySelector('.kb-main');
    const landing = document.querySelector('.kb-landing-main');
    if (main instanceof HTMLElement) roots.push(main);
    if (landing instanceof HTMLElement) roots.push(landing);
    if (roots.length === 0) roots.push(window);

    const read = () => {
      const top = roots.reduce((max, root) => {
        const t = root === window ? window.scrollY : (root as HTMLElement).scrollTop;
        return Math.max(max, t);
      }, 0);
      setScrolled(top > 8);
    };
    read();
    roots.forEach((root) => root.addEventListener('scroll', read, { passive: true }));
    return () => roots.forEach((root) => root.removeEventListener('scroll', read));
  }, []);

  const compact = mode !== 'full';

  return (
    <header
      ref={headerRef}
      className={[
        'kb-header kb-header--main',
        scrolled ? 'is-scrolled' : '',
        compact ? 'kb-header--compact' : '',
        mode === 'stacked' ? 'kb-header--stacked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="kb-header__measure" aria-hidden>
        <span ref={wordRef} className="kb-logo__wordmark">
          Ядро
        </span>
        <div ref={burgerRef} className="kb-header__actions kb-header__actions-pill glass-panel">
          <span className="kb-header-icon-btn" />
        </div>
      </div>

      <div className="kb-header__left">
        <Link ref={brandRef} className="kb-header__brand" to="/" aria-label="Ядро — на главную">
          <KbLogo />
        </Link>
      </div>

      <div className="kb-header__center">
        <MainNav navRootRef={navRef} />
      </div>

      {compact ? (
        <HeaderOverflow includeNav={mode === 'stacked'} />
      ) : (
        <div ref={actionsRef} className="kb-header__actions kb-header__actions-pill glass-panel">
          <NotificationsBell />
          <HeaderSettings avatarTo="/dashboard" />
        </div>
      )}
    </header>
  );
}
