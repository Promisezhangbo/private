import SkillHome from "@/pages/home";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
const router = [
  {
    path: "/skill",
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: <SkillHome /> },
    ],
  },
];
export const routers = createBrowserRouter(router);
