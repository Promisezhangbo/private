import List from "@/pages/list";
import Detail from '@/pages/detail';
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
const route = [
  {
    path: "/blog",
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to='list' replace /> },
      { path: "list", element: <List /> },
      { path: "detail/:id", element: <Detail /> }
    ]
  }
];
export const router = createBrowserRouter(route);
