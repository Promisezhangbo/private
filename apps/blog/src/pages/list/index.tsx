import { useNavigate } from "react-router-dom";

function List() {
  const navigate = useNavigate();

  return (
    <div>
      List
      <button onClick={() => navigate("/agent")}>去agent</button>
    </div>
  );
}

export default List;
