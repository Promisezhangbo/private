export type Post = {
    id: string;
    title: string;
    date?: string;
    summary: string;
    content: string;
    source?: string;
};
export const posts: Post[] = [
    {
        id: '1',
        title: 'Web 前端性能优化实战（上）—— 首屏与白屏问题定位与优化',
        date: '2023-10-01',
        summary: '介绍了首屏加载、白屏定位与常见的优化思路，包括资源加载分析、渲染阻塞排查等。',
        content: `本文汇总并整理了作者在真实项目中定位首屏与白屏问题的经验，覆盖了资源优先级、渲染路径、关键渲染路径优化方法，以及常见的性能分析工具使用建议。文章给出了多种可操作的调优手段，帮助开发者快速定位瓶颈并施策。`,
        source: 'https://juejin.cn/post/7155151377013047304?searchId=202310201428043E156BF285B13E15D1B6#heading-0'
    },
    {
        id: '2',
        title: '浏览器工作原理与前端优化策略',
        date: '2023-10-15',
        summary: '从浏览器内部机制角度介绍性能优化要点，包含事件循环、渲染流程与内存管理等。',
        content: `本文从浏览器的事件循环、任务队列、布局与绘制流程出发，解释了为何某些操作会导致卡顿或回流，并给出相应的编码实践与优化建议，适合希望深入理解性能本质的前端工程师。`,
        source: 'https://juejin.cn/post/7164175171358556173'
    },
    {
        id: '3',
        title: '前端工程化与构建性能优化实践',
        date: '2023-11-02',
        summary: '围绕构建链与工程化实践，介绍了如何通过分包、缓存、编译器优化等手段提升构建与运行性能。',
        content: `文章讨论了构建工具（如 webpack / vite）相关的优化手段：合理拆分 chunk、利用持久化缓存、启用编译缓存、以及按需加载等。同时也讲述了 CI/CD 中的构建优化策略。`,
        source: 'https://juejin.cn/post/7170852747749621791'
    }
];
/** 按 id 查找文章，未命中返回 undefined */
export function findPost(id: string) {
    return posts.find(p => p.id === id);
}
