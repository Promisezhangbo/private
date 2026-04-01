import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

const SkillHome = lazy(() => import('@/pages/home'));

const router = [
  {
    path: '/skill',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: 'home', element: <SkillHome /> },
    ],
  },
];
export const routers = createBrowserRouter(router);
