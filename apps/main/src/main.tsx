import App from '@/App';
import { logDeployTag } from '@packages/vite-build-utils/logDeployTag';
import { createRoot } from 'react-dom/client';
import './app.scss';

logDeployTag('main', 'color:#14b8a6;font-size:16px;font-weight:bold');
createRoot(document.getElementById('root')!).render(<App />);
