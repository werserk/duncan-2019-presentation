#!/usr/bin/env bash
set -euo pipefail
command -v node >/dev/null || { echo 'Установите Node.js 22+ для запуска.' >&2; exit 1; }
command -v tar >/dev/null || { echo 'Для распаковки нужен tar.' >&2; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<22){console.error("Нужен Node.js 22+");process.exit(1)}'
delivery_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
show_dir=$(mktemp -d "${TMPDIR:-/tmp}/duncan-2019-show.XXXXXX")
trap 'rm -rf -- "$show_dir"' EXIT
tar -xzf "$delivery_dir/presentation-offline.tar.gz" -C "$show_dir"
node "$show_dir/serve.mjs" "${1:-4173}"
