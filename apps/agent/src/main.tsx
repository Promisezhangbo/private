import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App.tsx'
import { qiankunWindow, renderWithQiankun } from 'vite-plugin-qiankun/dist/helper'

let root: Root | null = null

function render(props: any) {
  const { container, mountId } = props ?? {}
  console.log(container,props,'测试一下');
  
  if (container) {
    root = createRoot(document.querySelector(mountId)!)
  } else {
    root = createRoot(document.getElementById('root')!)
  }
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

renderWithQiankun({
  bootstrap: async () => {
    console.log('【agent】初始化');
  },
  mount: async (props) => {
    console.log('【agent】挂载完成', props);
    render(props)
  },
  unmount: async (props) => {
    console.log('【agent】卸载完成', props);
  },
  update: async (props) => {
    console.log('【agent】更新完成', props);
  },
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({})
}

// export async function bootstrap(props) {
//   console.log('初始化', props);

// }

// export async function mount(props: any) {
//   console.log('挂载完成', props);
//   render(props)
// }

// export async function unmount(props) {
//   console.log('卸载完成', props);

// }

// export async function update(props) {
//   console.log('更新完成', props);
// }