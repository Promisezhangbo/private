# 说明文档

## 项目说明

## 配置相关

### ts相关配置
ts的配置做了一个基础的抽离，将公共的配置单独抽成了一个包，便于维护及形成一个公共规范
这个包叫做 @packages/ts-config, 并且通过pnpm workspace:* 的方式链接到子应用
修改 @packages/ts-config 的配置后,子应用便可直接生效

如修改不生效，请检查子应用 package.json的依赖配置，或则子应用的tsconfig.json 配置
或者直接进行一次pnpm i