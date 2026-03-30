import { api } from "@/utils/request";
import type { KnowledgeBaseListItem, ListDatasetResponse } from "@packages/openapi";
import React, { useEffect, useState } from "react";

function ResumeHome() {
  const [dataset, setDataset] = useState<ListDatasetResponse>();
  const [dataList, setDataList] = useState<KnowledgeBaseListItem[]>([]);

  async function getDataFn() {
    const { data } = await api.listKnowledgeBases({
      body: { request_id: crypto.randomUUID() },
    });
    console.log(data?.results, "data===data888888");
    setDataList(data?.results ?? []);

    // const { data } = await api.listDataset({
    //   body: { request_id: crypto.randomUUID() },
    // });
    // console.log(data, "data===data");
    // setDataset(data);
  }

  useEffect(() => {
    getDataFn();
  }, []);

  return (
    <div>
      <div>ResumeHome</div>
      {dataset ? <p>{dataset.dataset_title ?? dataset.dataset_name ?? "—"}</p> : null}
    </div>
  );
}

export default ResumeHome;
