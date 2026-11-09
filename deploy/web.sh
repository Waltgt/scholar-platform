#!/usr/bin/env bash
# Se ejecuta en el runner. Copia el build de Vue a una carpeta nueva en web
# y cambia el symlink "current" de forma atómica (Nginx sirve current).
set -euo pipefail

RELEASE="${GITHUB_SHA:?GITHUB_SHA no definido}"
BASE=/srv/scholar/web
DIR="$BASE/releases/$RELEASE"

ssh web "mkdir -p '$DIR'"
rsync -a --delete web/dist/ "web:$DIR/"

ssh web bash -s -- "$BASE" "$DIR" <<'REMOTE'
set -euo pipefail
BASE="$1"
DIR="$2"

ln -sfn "$DIR" "$BASE/current.tmp"
mv -T "$BASE/current.tmp" "$BASE/current"

CURRENT=$(readlink -f "$BASE/current")
ls -1dt "$BASE"/releases/*/ | tail -n +4 | while read -r d; do
  [ "$(readlink -f "$d")" = "$CURRENT" ] || rm -rf "$d"
done
REMOTE
