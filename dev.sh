#!/usr/bin/env bash
# ──────────────────────────────────────────────
# ZBURLIUC FURNITURE — Dev environment launcher
# ──────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colors ───────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${CYAN}▶${NC} $1"; }
ok()   { echo -e "${GREEN}✔${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✖${NC} $1"; }

echo ""
echo -e "${BOLD}  ZBURLIUC FURNITURE — Dev Launcher${NC}"
echo -e "  ──────────────────────────────────"
echo ""

# ── 1. Node version ───────────────────────────
REQUIRED_NODE="20.19.0"
if command -v nvm &>/dev/null 2>&1 || [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
  nvm use "$REQUIRED_NODE" --silent 2>/dev/null || nvm install "$REQUIRED_NODE"
fi
CURRENT_NODE=$(node --version 2>/dev/null || echo "none")
if [[ "$CURRENT_NODE" != "v${REQUIRED_NODE}" ]]; then
  warn "Node $CURRENT_NODE detected, but v${REQUIRED_NODE} is required."
  warn "Run: nvm use ${REQUIRED_NODE}"
fi
ok "Node $CURRENT_NODE"

# ── 2. PostgreSQL check ───────────────────────
log "Checking PostgreSQL…"
if docker ps 2>/dev/null | grep -q "doors-postgres"; then
  ok "PostgreSQL running in Docker (port 5432)"
else
  warn "Docker container 'doors-postgres' not found. Starting it…"
  if docker ps -a 2>/dev/null | grep -q "doors-postgres"; then
    docker start doors-postgres
    ok "Started existing container"
  else
    warn "Container doesn't exist. Creating a new one…"
    docker run -d \
      --name doors-postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=doors \
      -p 5432:5432 \
      --health-cmd="pg_isready -U postgres" \
      --health-interval=5s \
      postgres:16-alpine
    log "Waiting for PostgreSQL to be ready…"
    sleep 5
    ok "Created and started 'doors-postgres' container"
  fi
fi

# ── 3. Prisma sync ────────────────────────────
log "Syncing Prisma schema…"
cd "$ROOT"
npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -3
ok "Database schema up to date"

# ── 4. Launch apps ────────────────────────────
echo ""
echo -e "${BOLD}  Starting dev servers…${NC}"
echo -e "  API  → http://localhost:3000"
echo -e "  Web  → http://localhost:4200"
echo -e "  Docs → http://localhost:3000/api/v1/docs"
echo -e "  DB   → run ${CYAN}npm run db:studio${NC} for Prisma Studio"
echo ""

export NX_IGNORE_UNSUPPORTED_TS_SETUP=true

# Run both in parallel, kill both on Ctrl+C
trap 'echo ""; warn "Shutting down…"; kill %1 %2 2>/dev/null; exit 0' INT TERM

npx nx serve @org/api &
API_PID=$!

npx nx serve web &
WEB_PID=$!

wait $API_PID $WEB_PID
