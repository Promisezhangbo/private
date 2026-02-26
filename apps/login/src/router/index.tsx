import Register from "@/pages/register";
import Singin from "@/pages/singin";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
const router = [
  {
    path: "/login",
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to='singin' replace /> },
      { path: "singin", element: <Singin /> },
      { path: "register", element: <Register /> }
    ]
  }
];

export const routers = createBrowserRouter(router);
