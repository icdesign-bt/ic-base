import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'ic-kit/styles.css';
import './styles/app.css';
import './styles/shell.css';
import './styles/skin-glass.css';
import App from './App';
import { initAppearance } from './utils/theme';

initAppearance();

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
