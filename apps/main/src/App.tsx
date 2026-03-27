import { router } from "@/router";
import QiankunProvider from "./components/QiankunProvider";
import { ThemeRoot } from "./theme/ThemeRoot";
import { RouterProvider } from "react-router-dom";
function App() {
  return (
    <ThemeRoot>
      <QiankunProvider>
        <RouterProvider router={router} />
      </QiankunProvider>
    </ThemeRoot>
  );
}
export default App;
