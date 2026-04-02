import Layouts from '@/layouts';
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

const Home = lazy(() => import('@/pages/home'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layouts />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: 'home', element: <Home /> },
      { path: ':appName/*', element: <div /> },
    ],
  },
]);
