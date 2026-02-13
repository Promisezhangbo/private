import List from "@/pages/list";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

const route = [
    {
        path: "/blog",
        element: <Outlet />,
        children: [
            { index: true, element: <Navigate to="list" replace /> },
            { path: "list", element: <List /> },
        ]
    }
];

export const router = createBrowserRouter(route);