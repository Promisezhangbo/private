import React, { useEffect } from 'react'
import { registerAppsFn } from '@/utils/qiankun'

function QiankunProvider(props) {
  useEffect(() => {
    registerAppsFn()

  }, [])
  return (
    <div>{props?.children}</div>
  )
}

export default QiankunProvider