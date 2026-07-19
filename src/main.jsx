// main.jsx
import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppShell from './Components/AppShell.jsx';
import App from './pages/App.jsx';
import StartupLoaderGate from './Components/StartupLoaderGate.jsx';
import ErrorBoundary, { RouteErrorFallback } from './Components/ErrorBoundary.jsx';

// Lazy-load all pages for code-splitting (faster initial load)
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const Certificates = lazy(() => import('./pages/Certificates.jsx'));
const Tools = lazy(() => import('./pages/Tools.jsx'));


const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteErrorFallback />,
    children: [
      { path: '/', element: <App /> },
      { path: '/projects', element: <Suspense fallback={null}><Projects /></Suspense> },
      { path: '/about', element: <Suspense fallback={null}><ContactPage /></Suspense> },
      { path: '/certificates', element: <Suspense fallback={null}><Certificates /></Suspense> },
      { path: '/tools', element: <Suspense fallback={null}><Tools /></Suspense> },

    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <StartupLoaderGate>
        <RouterProvider router={router} />
      </StartupLoaderGate>
    </ErrorBoundary>
  </StrictMode>
);
