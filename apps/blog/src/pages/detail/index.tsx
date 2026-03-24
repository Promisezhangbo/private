import { useParams, useNavigate } from 'react-router-dom';
import { findPost } from '@/data/posts';
import { Card, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './index.scss';
const { Title, Paragraph, Link: TyLink } = Typography;
function Detail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const post = findPost(id);
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
    <div className="blog-shell">
      <Card className="blog-detail-card" bordered={false}>
        <Title level={2} className="blog-detail-title">
          {post.title}
        </Title>
        {post.date ? <div className="blog-detail-meta">{post.date}</div> : null}
        <Paragraph className="blog-detail-body">{post.content}</Paragraph>
        {post.source ? (
          <div className="blog-detail-source">
            <TyLink href={post.source} target="_blank" rel="noreferrer">
              查看原文 →
            </TyLink>
          </div>
        ) : null}
        <div className="blog-detail-back">
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
        </div>
      </Card>
    </div>
  );
}
export default Detail;
