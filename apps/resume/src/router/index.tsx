import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

const ResumeHome = lazy(() => import('@/pages/home'));

const router = [
  {
    path: '/resume',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: 'home', element: <ResumeHome /> },
    ],
  },
];
export const routers = createBrowserRouter(router);
