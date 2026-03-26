import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  console.log(9999);

  return (
    <div className="agent-app-root">
      <RouterProvider router={router} />
    </div>
  );
}
