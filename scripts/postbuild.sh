#!/bin/bash

echo "[postbuild] 生成 404 fallback:dist/404.html → dist/main/index.html(解决静态托管刷新 404)"
cp dist/main/index.html dist/404.html 

echo "[postbuild] 生成根入口:dist/index.html → dist/main/index.html"
cp dist/main/index.html dist/index.html 


echo "[postbuild] 写入重写规则:dist/_redirects(/* → /main/index.html 200)"
echo '/*  /main/index.html  200' > dist/_redirects

echo "[postbuild]完成 ✅ "