#!/usr/bin/env bash
# Se ejecuta en el runner. Copia el build a una carpeta nueva en app,
# aplica migraciones y cambia el symlink "current" de forma atómica.
set -euo pipefail

RELEASE="${GITHUB_SHA:?GITHUB_SHA no definido}"
BASE=/srv/scholar/api
DIR="$BASE/releases/$RELEASE"

ssh app "mkdir -p '$DIR'"

rsync -a --delete \
  api/dist api/node_modules api/prisma \
  api/prisma.config.ts api/package.json api/package-lock.json \
  "app:$DIR/"

ssh app bash -s -- "$BASE" "$DIR" <<'REMOTE'
set -euo pipefail
BASE="$1"
DIR="$2"

cd "$DIR"

# Migraciones con el rol migrator (si fallan, current no cambia y sigue la versión anterior)
set -a
. /etc/scholar/migrate.env
set +a
./node_modules/.bin/prisma migrate deploy

# Cambio atómico de versión
ln -sfn "$DIR" "$BASE/current.tmp"
mv -T "$BASE/current.tmp" "$BASE/current"

sudo -n systemctl restart scholar-api

# Conservar las 3 versiones más recientes (nunca borrar la activa)
CURRENT=$(readlink -f "$BASE/current")
ls -1dt "$BASE"/releases/*/ | tail -n +4 | while read -r d; do
  [ "$(readlink -f "$d")" = "$CURRENT" ] || rm -rf "$d"
done
REMOTE
