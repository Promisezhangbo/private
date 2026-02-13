import App from "@/App";
import QiankunProvider from "@/components/QiankunProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QiankunProvider>
      <App />
    </QiankunProvider>
  </StrictMode>
);





