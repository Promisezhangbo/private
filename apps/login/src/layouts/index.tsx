import { routers } from "@/router";
import { RouterProvider } from "react-router-dom";
import AuthShell from "@/components/AuthShell";

function Layouts() {
  return (
    <AuthShell>
      <RouterProvider router={routers} />;
    </AuthShell>
  );
}
export default Layouts;
