import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/components/layout/navItems';

type Props = {
  navRootRef?: RefObject<HTMLElement | null>;
};

export function MainNav({ navRootRef }: Props) {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const activeTo = NAV_ITEMS.find((item) => item.match(pathname))?.to ?? null;

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav || !activeTo) {
      setIndicator((s) => ({ ...s, width: 0, ready: false }));
      return;
    }
    const el = itemRefs.current.get(activeTo);
    if (!el) return;

    const update = () => {
      const navBox = nav.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      setIndicator({
        left: box.left - navBox.left,
        width: box.width,
        ready: true,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [activeTo, pathname]);

  return (
    <nav
      ref={(node) => {
        navRef.current = node;
        if (navRootRef) navRootRef.current = node;
      }}
      className="kb-nav-pill glass-panel"
      aria-label="Основные разделы"
    >
      <span
        className={`kb-nav-pill__indicator${indicator.ready ? ' is-ready' : ''}`}
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: indicator.width,
        }}
        aria-hidden
      />
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive || item.match(pathname)
              ? 'kb-nav-pill__link is-active'
              : 'kb-nav-pill__link'
          }
          ref={(node) => {
            if (node) itemRefs.current.set(item.to, node);
            else itemRefs.current.delete(item.to);
          }}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
