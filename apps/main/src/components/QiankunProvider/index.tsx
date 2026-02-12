import { registerAppsFn } from '@/utils/qiankun'
import { Spin } from 'antd'
import { useEffect, useState } from 'react'

function QiankunProvider(props) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    registerAppsFn()


  }, [])
  return (
    <div>
      <Spin spinning={loading}>
        {props?.children}
      </Spin>
    </div>
  )
}

export default QiankunProvider