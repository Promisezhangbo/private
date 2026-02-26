import reactLogo from "@/assets/react.svg";
import { useNavigate } from "react-router-dom";
import viteLogo from "/vite.svg";

function Singin() {
  const navigate = useNavigate();
  return (
    <div>
      <a href='https://vite.dev' target='_blank'>
        <img src={viteLogo} className='logo' alt='Vite logo' />
      </a>
      <a href='https://react.dev' target='_blank'>
        <img src={reactLogo} className='logo react' alt='React logo' />
      </a>
      <button onClick={() => navigate("/agent")}>去首页111</button>
    </div>
  );
}

export default Singin;
