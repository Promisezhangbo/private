import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Alert, Button, Card, List as AntList, Space, Tabs, Typography } from 'antd';
import { getBlogList, type ServerBlogItem } from '@/api/blogServer';
import type { PostMeta } from '@/data/posts';
import { CATEGORY_TABS, postsByCategory, type BlogCategory } from '@/data/posts';
import './index.scss';

const { Title, Paragraph } = Typography;

function List() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<BlogCategory>('arch');
  const [serverBlogs, setServerBlogs] = useState<ServerBlogItem[]>([]);
  const [serverBlogsError, setServerBlogsError] = useState<string>();
  const list = useMemo(() => postsByCategory(category), [category]);

  const goDetail = (id: string) => navigate(`/blog/detail/${id}`);

  useEffect(() => {
    let ignore = false;

    getBlogList()
      .then((items) => {
        if (!ignore) {
          setServerBlogs(items);
          setServerBlogsError(undefined);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setServerBlogsError(error instanceof Error ? error.message : '博客服务接口调用失败');
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="blog-wrap">
      <div className="blog-shell">
        <header className="blog-hero">
          <Title level={2}>博客</Title>
          <Typography.Text type="secondary">
            按分类浏览收录文章；列表展示标题与摘要，正文来自本地 Markdown，原文链接在详情页。
          </Typography.Text>
        </header>

        <Tabs
          className="blog-category-tabs"
          activeKey={category}
          onChange={(k) => setCategory(k as BlogCategory)}
          items={CATEGORY_TABS.map((t) => ({
            key: t.key,
            label: t.label,
          }))}
        />

        <Alert
          type={serverBlogsError ? 'warning' : 'info'}
          showIcon
          message="Blog Server"
          description={
            serverBlogsError ? (
              serverBlogsError
            ) : (
              <Space wrap>
                {serverBlogs.length > 0 ? serverBlogs.map((blog) => <span key={blog.id}>{blog.name}</span>) : '暂无服务端 Blog'}
              </Space>
            )
          }
        />

        <AntList
          className="blog-list"
          split={false}
          dataSource={list}
          locale={{ emptyText: '该分类下暂无文章' }}
          renderItem={(p: PostMeta) => (
            <AntList.Item className="blog-list-item-wrap">
              <Card className="blog-card" variant="borderless">
                <div
                  className="blog-card-title"
                  onClick={() => goDetail(p.id)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && goDetail(p.id)}
                >
                  <BookOutlined />
                  {p.title}
                </div>
                <Paragraph className="blog-card-summary">{p.summary}</Paragraph>
                <div className="blog-list-footer">
                  <Button type="link" onClick={() => goDetail(p.id)} icon={<ArrowRightOutlined />}>
                    阅读全文
                  </Button>
                </div>
              </Card>
            </AntList.Item>
          )}
        />
      </div>
    </div>
  );
}

export default List;
