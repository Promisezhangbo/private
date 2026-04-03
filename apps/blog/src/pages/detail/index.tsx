import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Typography } from 'antd';
import { BlogMarkdown } from '@/components/BlogMarkdown';
import { findPost } from '@/data/posts';
import { loadPostMarkdown } from '@/lib/loadPostMarkdown';
import { parseMarkdownWithFrontmatter } from '@/lib/parseMarkdownDoc';
import './index.scss';

const { Title, Paragraph, Link: TyLink } = Typography;

function Detail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const post = findPost(id);
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!post) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setBody(null);
    void (async () => {
      const raw = await loadPostMarkdown(post.id);
      if (cancelled) return;
      if (raw === null) {
        setLoadError(true);
        setLoading(false);
        return;
      }
      const { body: docBody } = parseMarkdownWithFrontmatter(raw);
      setBody(docBody);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [post?.id]);

  if (!post) {
    return (
      <div className="blog-shell blog-empty">
        <Title level={3}>未找到文章</Title>
        <Paragraph>链接可能已失效或 ID 不正确。</Paragraph>
        <Button type="primary" ghost onClick={() => navigate('/blog/list')}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="blog-shell blog-detail-shell">
      <Card className="blog-detail-card" bordered={false}>
        <Title level={2} className="blog-detail-title">
          {post.title}
        </Title>
        <div className="blog-detail-meta">
          <span>{post.category === 'arch' ? '架构' : 'JavaScript'}</span>
          <span aria-hidden>·</span>
          <TyLink href={post.sourceUrl} target="_blank" rel="noreferrer">
            原文链接
          </TyLink>
        </div>

        <div className="blog-detail-article">
          {loading ? (
            <div className="blog-detail-loading">
              <Spin tip="加载正文…" />
            </div>
          ) : loadError ? (
            <Paragraph type="warning">
              未找到本地文档 <code className="blog-inline-code">{post.id}.md</code>。请检查{' '}
              <code className="blog-inline-code">src/assets/docs/</code> 是否已添加对应文件，或前往原文阅读。
            </Paragraph>
          ) : body ? (
            <BlogMarkdown markdown={body} />
          ) : null}
        </div>

        <div className="blog-detail-source">
          <TyLink href={post.sourceUrl} target="_blank" rel="noreferrer">
            在浏览器中打开原文
          </TyLink>
        </div>

        <div className="blog-detail-back">
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/blog/list')}>
            返回列表
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Detail;
