import { useParams, useNavigate } from 'react-router-dom';
import { findPost } from '@/data/posts';
import { Card, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Paragraph, Link: TyLink } = Typography;

function Detail() {
    const params = useParams();
    const id = params.id ?? '';
    const post = findPost(id);

    const navigate = useNavigate();

    if (!post) {
        return (
            <div style={{ padding: 24 }}>
                <Title level={3}>未找到文章</Title>
                <Paragraph>可能文章不存在或 ID 错误。</Paragraph>
                <div>
                    <Button type="link" onClick={() => navigate('/blog/list')}>返回列表</Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 900 }}>
                <Card style={{ borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                    <Title level={2} style={{ marginBottom: 8 }}>{post.title}</Title>
                    {post.date && <div style={{ color: '#999', marginBottom: 16 }}>{post.date}</div>}
                    <Paragraph style={{ lineHeight: 1.9, fontSize: 16, color: '#333' }}>{post.content}</Paragraph>
                    <div style={{ marginTop: 18 }}>
                        <TyLink href={post.source} target="_blank">查看原文</TyLink>
                    </div>
                    <div style={{ marginTop: 18 }}>
                        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                            返回列表
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Detail;
