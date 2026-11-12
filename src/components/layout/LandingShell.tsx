import { Outlet } from 'react-router-dom';
import { MainHeader } from '@/components/layout/MainHeader';
import { PreviewDrawer } from '@/components/preview/PreviewDrawer';

export function LandingShell() {
  return (
    <div className="kb-shell kb-shell--landing">
      <main className="kb-landing-main">
        <MainHeader />
        <div className="kb-landing-main__content">
          <Outlet />
        </div>
      </main>
      <PreviewDrawer />
    </div>
  );
}
