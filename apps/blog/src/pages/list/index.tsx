import { useNavigate } from 'react-router-dom';
import { posts } from '@/data/posts';
import { Card, Typography, List as AntList, Button } from 'antd';
import { ArrowRightOutlined, BookOutlined } from '@ant-design/icons';
import type { Post } from '@/data/posts';
const { Title, Paragraph } = Typography;
function List() {
  const navigate = useNavigate();
  const goDetail = (id: string) => navigate(`/blog/detail/${id}`);
  return (
    <div className="blog-shell">
      <header className="blog-hero">
        <Title level={2}>博客</Title>
        <Typography.Text type="secondary">精选前端与工程化笔记，点击进入详情。</Typography.Text>
      </header>
      <AntList
        dataSource={posts}
        renderItem={(p: Post) => (
          <AntList.Item style={{ padding: 0, border: 'none', marginBottom: 16 }}>
            <Card className="blog-card" bordered={false}>
              <div
                className="blog-card-title"
                onClick={() => goDetail(p.id)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && goDetail(p.id)}
              >
                <BookOutlined style={{ color: '#ea580c' }} />
                {p.title}
              </div>
              <Paragraph style={{ margin: '10px 0 0', color: '#57534e' }}>{p.summary}</Paragraph>
              <div style={{ marginTop: 14 }}>
                <Button type="link" onClick={() => goDetail(p.id)} icon={<ArrowRightOutlined />}>
                  阅读全文
                </Button>
              </div>
            </Card>
          </AntList.Item>
        )}
      />
    </div>
  );
}
export default List;
