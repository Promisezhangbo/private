import React, { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AgentLayout from "../layouts/AgentLayout";

const Home = lazy(() => import("@/pages/home"));

const route = [
  {
    path: "/agent",
    element: <AgentLayout />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: <Home /> },
    ],
  },
];

export const router = createBrowserRouter(route);
