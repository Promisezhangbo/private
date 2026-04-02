#!/usr/bin/env bash
# 将「仅构建好的某一个子应用」合并进即将发布的站点目录：
# 1) 从 origin/gh-pages 解压到临时目录(保留其它子应用与根目录文件)
# 2) 用本次 dist/<app> 覆盖对应子目录
# 3) 若构建的是 main，同步更新站点根 index.html / 404.html(与 postbuild 行为一致)
# <app> 须为 apps/<app>/package.json 存在的目录名(新增子应用无需改本脚本)
set -euo pipefail

APP="${1:?用法: merge_app_dist_to_deploy.sh <子应用目录名，如 main、login、skill>}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if [[ ! -f "apps/$APP/package.json" ]]; then
  echo "未知子应用: $APP(缺少 apps/$APP/package.json)" >&2
  exit 1
fi

if [[ ! -d "dist/$APP" ]]; then
  echo "缺少 dist/$APP,请先对该子应用执行 pnpm build" >&2
  exit 1
fi

SITE="_site_merge_tmp"
rm -rf "$SITE"
mkdir -p "$SITE"

git fetch origin gh-pages:refs/remotes/_merge_gh_pages 2>/dev/null || true
if git rev-parse --verify refs/remotes/_merge_gh_pages >/dev/null 2>&1; then
  git archive --format=tar refs/remotes/_merge_gh_pages | tar -x -C "$SITE"
  echo "✅ 已合并远程 gh-pages 现有内容"
else
  echo "ℹ️ 尚无 gh-pages(首次部署单应用时站点可能不完整，建议首次用「全部」)"
fi

mkdir -p "$SITE/$APP"
rsync -a --delete "dist/$APP/" "$SITE/$APP/"

if [[ "$APP" == "main" ]]; then
  cp -f "dist/$APP/index.html" "$SITE/index.html"
  cp -f "dist/$APP/index.html" "$SITE/404.html"
  if [[ -f "dist/_redirects" ]]; then
    cp -f "dist/_redirects" "$SITE/_redirects"
  fi
  echo "✅ 已用 main 更新站点根 index / 404"
fi

rm -rf dist
mv "$SITE" dist
echo "✅ 发布目录已就绪: dist/(含子应用 $APP 及未改动的其它目录)"
