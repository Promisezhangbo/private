import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const a = "str111";
  console.log(a);

  return (
    <div>
      "父应用首页"
      <button onClick={() => navigate("/agent")}>子应用1 Home</button>
      <button onClick={() => navigate("/blog")}>子应用2 Home</button>
    </div>
  );
}

export default Home;
