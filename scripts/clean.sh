#!/bin/bash

echo "🔄 清理所有 node_modules..."
pnpm -r exec rm -rf node_modules

echo "🔧 清理根目录依赖..."
rm -rf node_modules pnpm-lock.yaml

echo "🔧 清理生成的API..."
rm -rf packages/openapi/gen

echo "📦 重新安装依赖..."
pnpm install

echo "✅ 完成！"