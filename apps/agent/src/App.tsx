import { RouterProvider } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import { router } from "./router";
import viteLogo from "/vite.svg";

function App() {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>我是agent</h1>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
