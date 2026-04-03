import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  a: ({ href, children, ...rest }) => (
    <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
      {children}
    </a>
  ),
  img: ({ src, alt, ...rest }) => <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" {...rest} />,
};

export function BlogMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="blog-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
