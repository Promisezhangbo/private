import { api } from '@/utils/request';
import type { KnowledgeBaseListItem, ListDatasetResponse } from '@packages/openapi/blog-gen-types';
import React, { useEffect, useState } from 'react';

function ResumeHome() {
  const [dataList, setDataList] = useState<KnowledgeBaseListItem[]>([]);

  async function getDataFn() {
    const { data } = await api.listKnowledgeBases({
      body: { request_id: crypto.randomUUID() },
    });
    console.log(data?.results, 'data===data888888');
    setDataList(data?.results ?? []);

    // const res1 = await loginApi.datasetServiceAllDatasetTags({});

    // console.log(res1);
  }

  useEffect(() => {
    getDataFn();
  }, []);

  return (
    <div>
      <div>ResumeHome 测试一下打包问题</div>
    </div>
  );
}

export default ResumeHome;
