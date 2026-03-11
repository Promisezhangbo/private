import Layouts from "@/layouts";
import Home from "@/pages/home";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
const route = [
  {
    path: "/",
    element: <Outlet />,
    children: [
      // { index: true, element: <Navigate to='home' replace /> },
      // { path: "home", element: <Home /> },
      // 自动匹配子应用路由 (e.g. /agent, /blog, /login)
      { path: "agent/*", element: <Layouts /> },
      { path: "blog/*", element: <Layouts /> },
      { path: "login/*", element: <Layouts /> },
    ]
  }
];
export const router = createBrowserRouter(route);
