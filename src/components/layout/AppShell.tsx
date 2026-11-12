import { Outlet } from 'react-router-dom';
import { MainHeader } from '@/components/layout/MainHeader';
import { PreviewDrawer } from '@/components/preview/PreviewDrawer';

export function AppShell() {
  return (
    <div className="kb-shell kb-shell--app">
      <div className="kb-shell__body">
        <main className="kb-main">
          <MainHeader />
          <div className="kb-main__content">
            <Outlet />
          </div>
        </main>
      </div>
      <PreviewDrawer />
    </div>
  );
}
