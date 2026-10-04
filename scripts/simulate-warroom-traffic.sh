#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:4000}"
ITERATIONS="${2:-60}"

echo "=================================================="
echo "⚡ Starting Load-Test War Room Traffic Generator"
echo "Target: ${BASE_URL}"
echo "Iterations: ${ITERATIONS}"
echo "=================================================="

ROUTES=(
  "/health"
  "/jobs"
  "/careers"
  "/skills"
  "/learner/profile"
  "/api/bot/intents"
  "/api/curriculum/certifications"
  "/api/curriculum/expertise"
  "/api/dashboard/public-stats"
  "/api/dashboard/visitors"
  "/unknown-route"
)

for ((i = 1; i <= ITERATIONS; i++)); do
  for ROUTE in "${ROUTES[@]}"; do
    curl -s -o /dev/null -w "%{http_code} %{time_total}s -> ${ROUTE}\n" "${BASE_URL}${ROUTE}" || true &
  done
  wait
  sleep 0.5
done

echo ""
echo "✅ Finished traffic generation. Check Grafana at http://localhost:3001"
