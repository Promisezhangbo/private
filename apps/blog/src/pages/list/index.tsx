import { useNavigate } from "react-router-dom";
import { posts } from "@/data/posts";
import { Card, Typography, List as AntList, Button } from "antd";
import { ArrowRightOutlined, BookOutlined } from "@ant-design/icons";
import type { Post } from "@/data/posts";
import "./index.scss";
const { Title, Paragraph } = Typography;
function List() {
  const navigate = useNavigate();
  console.log(11111);

  const goDetail = (id: string) => navigate(`/blog/detail/${id}`);
  return (
    <div className="blog-warp">
      <div className="blog-shell">
        <header className="blog-hero">
          <div className="blog-hero__kicker">
            <span className="blog-hero__kicker-pulse" aria-hidden />
            Tech Notes
          </div>
          <Title level={2}>博客</Title>
          <Typography.Text type="secondary">
            前端 · 工程化 · 架构笔记 — 卡片悬停预览，点击进入全文
          </Typography.Text>
        </header>
        <AntList
          split={false}
          dataSource={posts}
          renderItem={(p: Post) => (
            <AntList.Item className="blog-list-item-wrap">
              <Card className="blog-card" variant="borderless">
                <div
                  className="blog-card-title"
                  onClick={() => goDetail(p.id)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && goDetail(p.id)}
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
