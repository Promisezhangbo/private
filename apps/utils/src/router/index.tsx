import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

const UtilsList = lazy(() => import('@/pages/list'));
const StockCost = lazy(() => import('@/pages/stock-cost'));

const router = [
  {
    path: '/utils',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: 'list', element: <UtilsList /> },
      { path: 'stock-cost', element: <StockCost /> },
    ],
  },
];

export const routers = createBrowserRouter(router);
