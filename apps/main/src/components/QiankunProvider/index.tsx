import { registerAppsFn } from "@/utils/qiankun";
import { Spin } from "antd";
import { useEffect, useState, type PropsWithChildren } from "react";

function QiankunProvider(props: PropsWithChildren) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    registerAppsFn();
  }, []);
  return (
    <div>
      <Spin spinning={loading}>{props?.children}</Spin>
    </div>
  );
}

export default QiankunProvider;
