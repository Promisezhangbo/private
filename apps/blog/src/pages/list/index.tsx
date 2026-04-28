import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Input,
  List as AntList,
  Modal,
  Pagination,
  Space,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import { getBlog, getBlogList, type ServerBlogItem } from '@/api/blogServer';
import type { PostMeta } from '@/data/posts';
import { CATEGORY_TABS, postsByCategory, type BlogCategory } from '@/data/posts';
import './index.scss';

const { Title, Paragraph } = Typography;

function List() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<BlogCategory>('arch');
  const [serverBlogs, setServerBlogs] = useState<ServerBlogItem[]>([]);
  const [serverBlogsError, setServerBlogsError] = useState<string>();
  const [serverPage, setServerPage] = useState(1);
  const [serverPageSize, setServerPageSize] = useState(10);
  const [serverTotal, setServerTotal] = useState(0);
  const [nameDraft, setNameDraft] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<ServerBlogItem | null>(null);
  const [detailError, setDetailError] = useState<string>();
  const list = useMemo(() => postsByCategory(category), [category]);

  const goDetail = (id: string) => navigate(`/blog/detail/${id}`);

  useEffect(() => {
    let ignore = false;

    getBlogList({
      page: serverPage,
      pageSize: serverPageSize,
      name: nameQuery || undefined,
    })
      .then((pageData) => {
        if (!ignore) {
          setServerBlogs(pageData.items);
          setServerTotal(pageData.total);
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
  }, [serverPage, serverPageSize, nameQuery]);

  const openServerBlogDetail = (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(undefined);
    setDetailItem(null);
    getBlog(id)
      .then((item) => {
        setDetailItem(item);
      })
      .catch((e: unknown) => {
        setDetailError(e instanceof Error ? e.message : '加载失败');
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

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
          message="Deno blog-server"
          description={
            serverBlogsError ? (
              serverBlogsError
            ) : (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Input.Search
                  allowClear
                  placeholder="按名称子串筛选（不区分大小写）"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onSearch={(v) => {
                    setNameQuery(v.trim());
                    setServerPage(1);
                  }}
                />
                <Space wrap>
                  {serverBlogs?.length > 0
                    ? serverBlogs?.map((blog) => (
                        <Button
                          key={String(blog.id)}
                          type="link"
                          size="small"
                          onClick={() => openServerBlogDetail(blog.id)}
                        >
                          {blog.name}
                        </Button>
                      ))
                    : '暂无服务端 Blog'}
                </Space>
                {!serverBlogsError && serverTotal > 0 ? (
                  <Pagination
                    size="small"
                    current={serverPage}
                    pageSize={serverPageSize}
                    total={serverTotal}
                    showSizeChanger
                    pageSizeOptions={['5', '10', '20', '50']}
                    showTotal={(total) => `共 ${total} 条`}
                    onChange={(page, pageSize) => {
                      setServerPage(page);
                      setServerPageSize(pageSize);
                    }}
                  />
                ) : null}
              </Space>
            )
          }
        />

        <Modal
          title="服务端博客详情（GET /getBlog）"
          open={detailOpen}
          onCancel={() => setDetailOpen(false)}
          footer={null}
          destroyOnClose
        >
          {detailLoading ? (
            <Spin />
          ) : detailError ? (
            <Typography.Text type="danger">{detailError}</Typography.Text>
          ) : detailItem ? (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="id">{detailItem.id}</Descriptions.Item>
              <Descriptions.Item label="name">{detailItem.name}</Descriptions.Item>
              <Descriptions.Item label="content">{detailItem.content ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="created_at">{detailItem.created_at ?? '—'}</Descriptions.Item>
            </Descriptions>
          ) : null}
        </Modal>

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
