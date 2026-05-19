import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

const AppHome = lazy(() => import('@/pages/home'));

const router = [
  {
    path: '/__NAME__',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: 'home', element: <AppHome /> },
    ],
  },
];

export const routers = createBrowserRouter(router);
