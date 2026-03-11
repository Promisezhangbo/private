1. 切换子应用样式丢失问题

修改: 主应用加上 ConfigProvider theme={{}} 配置

```tsx
<ConfigProvider theme={{}} locale={zhCN}>
  <QiankunProvider>
    <RouterProvider router={router} />;
  </QiankunProvider>
</ConfigProvider>
```
