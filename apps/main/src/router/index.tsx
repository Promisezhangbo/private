import Layouts from "@/layouts"
import Home from "@/pages/home"
import { createBrowserRouter, Navigate } from "react-router-dom"

const route = [
    {
        path: '/',
        element: <Layouts />,
        children: [
            { index: true, element: <Navigate to='home' replace /> },
            { path: 'home', element: <Home /> },
            { path: '/agent/*', element: <div id='sub-app' /> },
            { path: '/blog/*', element: <div id='sub-app' /> },
        ]
    }
]

export const router = createBrowserRouter(route)