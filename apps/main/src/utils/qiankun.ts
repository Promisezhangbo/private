import { registerMicroApps, start } from "qiankun"

const apps = [
    {
        name: 'agent',
        entry: '//localhost:9001',
        container: '#subapp',
        activeRule: '/agent',
        props: {
            mountId: '#subapp'
        }
    }
]


export function registerAppsFn() {
    registerMicroApps(apps, {
        beforeLoad: async (props) => {
            console.log('加载前', props);
        },
        afterMount: async (props) => {
            console.log('挂载后', props);
        },
        afterUnmount: async (props) => {
            console.log('卸载后', props);
        },
        beforeMount: async (props) => {
            console.log('挂载前', props);
        },
        beforeUnmount: async (props) => {
            console.log('卸载前', props);
        },
    })
    start({
        prefetch: true, sandbox: {
            experimentalStyleIsolation:true,
            strictStyleIsolation: true
        }
    })
}