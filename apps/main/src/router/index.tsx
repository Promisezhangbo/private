import Layouts from "@/layouts";
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

const Home = lazy(() => import("@/pages/home"));

const route = [
  {
    path: "/",
    element: <Layouts />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: <Home /> },
      // 自动匹配子应用路由 (e.g. /agent, /blog, /login)
      { path: ":appName/*", element: <div /> },
    ],
  },
];
export const router = createBrowserRouter(route);
