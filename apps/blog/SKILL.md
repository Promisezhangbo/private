# Blog 站点文档

## 文章链接

[架构]

1. https://juejin.cn/post/7085257325165936648
2. https://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247525499&idx=1&sn=2becb2be37a641c06bf873b9f3b7c970&chksm=f8495e31e3359fd302be07cb8fd551e07404bda49f1b9a805f3d8101efb8f6d4eea62d6330fd&mpshare=1&scene=1&srcid=03057p4FEiQmI3G6hYb0lKmO&sharer_shareinfo=8c64f400dd4984a3abecad1c63c287ca&sharer_shareinfo_first=8c64f400dd4984a3abecad1c63c287ca&version=4.1.26.70359&platform=mac#rd
3. https://juejin.cn/post/7155151377013047304?searchId=202310201428043E156BF285B13E15D1B6
4. https://segmentfault.com/a/1190000044622503
5. https://juejin.cn/post/7157739406835580965

[js]

1. https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
2. https://segmentfault.com/a/1190000016418021
3. https://es6.ruanyifeng.com/#docs/promise

## 搭建Blog页面

1. Blog页面顶部有一个Tab 切换文章类型
2. 当前的文章类型会展示一个文章列表
3. 文章列表中有一个文章标题和文章的简要描述
4. 文章标题是从上面文章链接中识别出来的
   - 所有识别出来的文章在 blog/src/assets/docs/ 下生成一个xxx.md
5. 点击这个列表的项则可以进入当前的文章详情
6. 文章详情是通过拉取上面链接进行展示的样式不需要和文章中百分百还原，但是文章中识别到的内容都需要展示，包括文案、图片、代码块等
7. 优化整个bolg子应用的样式
