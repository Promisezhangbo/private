// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate('/agent')}>子应用1</button>
      <button onClick={() => navigate('/blog')}>子应用2</button>

      <div id='sub-app'></div>
    </>
  )
}

export default App
