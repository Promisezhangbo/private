import { lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

const List = lazy(() => import("@/pages/list"));
const Detail = lazy(() => import("@/pages/detail"));

const route = [
  {
    path: "/blog",
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <List /> },
      { path: "detail/:id", element: <Detail /> },
    ],
  },
];
export const router = createBrowserRouter(route);
