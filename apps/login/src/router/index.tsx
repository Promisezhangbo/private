import { lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

const Register = lazy(() => import("@/pages/register"));
const Singin = lazy(() => import("@/pages/singin"));

const router = [
  {
    path: "/login",
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="singin" replace /> },
      { path: "singin", element: <Singin /> },
      { path: "register", element: <Register /> },
    ],
  },
];
export const routers = createBrowserRouter(router);
