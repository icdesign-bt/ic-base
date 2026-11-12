import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LandingShell } from '@/components/layout/LandingShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { FolderPage } from '@/pages/FolderPage';
import { LandingPage } from '@/pages/LandingPage';
import { LibrarySectionPage } from '@/pages/LibrarySectionPage';
import { MeetingPage } from '@/pages/MeetingPage';
import { MeetingsPage } from '@/pages/MeetingsPage';
import { OrgWikiPage } from '@/pages/OrgWikiPage';
import { ScopeFoldersPage } from '@/pages/ScopeFoldersPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { SearchPage } from '@/pages/SearchPage';
import { AppProvider } from '@/state/AppContext';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<LandingShell />}>
          <Route index element={<LandingPage />} />
        </Route>

        <Route element={<AppShell />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="library/:section" element={<LibrarySectionPage />} />
          <Route path="folders/:scope" element={<ScopeFoldersPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="org-wiki" element={<OrgWikiPage />} />
          <Route path="folder/:folderId" element={<FolderPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="meeting/:meetingId" element={<MeetingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
