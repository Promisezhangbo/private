import { router } from "@/router";
import QiankunProvider from "./components/QiankunProvider";
import { ThemeRoot } from "./theme/ThemeRoot";
import { RouterProvider } from "react-router-dom";
function App() {
  console.log(33333);

  return (
    <ThemeRoot>
      <QiankunProvider>
        <RouterProvider router={router} />
      </QiankunProvider>
    </ThemeRoot>
  );
}
export default App;
