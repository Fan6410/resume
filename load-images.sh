#!/bin/bash
echo "加载图片文件到 dist..."

# 需要加载的图片列表
images=(
  "public/projects/ZONE/zone01.jpg"
  "public/projects/ZONE/zone02.jpg"
  "public/projects/ZONE/zone03.jpg"
  "public/projects/ZONE/zone04.jpg"
  "public/projects/ZONE/zone05.jpg"
  "public/projects/ZONE/zonecover.jpg"
)

# 复制到 dist
for img in "${images[@]}"; do
  if [ -f "$img" ]; then
    dest="dist/${img#public/}"
    mkdir -p "$(dirname "$dest")"
    cp "$img" "$dest"
    echo "✓ 复制: $img -> $dest"
  fi
done

echo "✓ 图片加载完成！"
