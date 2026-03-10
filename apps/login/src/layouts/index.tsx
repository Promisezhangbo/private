import { routers } from "@/router";
import { RouterProvider } from "react-router-dom";
function Layouts() {
  return <RouterProvider router={routers} />;
}
export default Layouts;
