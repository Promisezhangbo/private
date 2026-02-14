// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { router } from "@/router";
import { RouterProvider } from "react-router-dom";

function App() {
  const a = "1";
  const b = "2";
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
