import { Button, message, Typography } from 'antd';
import { useCallback } from 'react';

type Props = {
  code: string;
  title?: string;
};

export function CodeBlock({ code, title }: Props) {
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      message.success('已复制');
    } catch {
      message.error('复制失败');
    }
  }, [code]);

  return (
    <div className="openapi-demo__code-block">
      <div className="openapi-demo__code-head">
        {title ? <Typography.Text type="secondary">{title}</Typography.Text> : <span />}
        <Button size="small" onClick={() => void copy()}>
          复制
        </Button>
      </div>
      <pre className="openapi-demo__pre">{code}</pre>
    </div>
  );
}
