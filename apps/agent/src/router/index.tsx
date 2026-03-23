import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AgentLayout from '../layouts/AgentLayout';
import Home from '../pages/home';

const route = [
  {
    path: '/agent',
    element: <AgentLayout />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: 'home', element: <Home /> },
    ],
  },
];

export const router = createBrowserRouter(route);
