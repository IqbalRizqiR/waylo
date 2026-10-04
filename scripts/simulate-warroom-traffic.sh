#!/usr/bin/env bash
set -euo pipefail

RAW_URL="${1:-http://localhost:4000}"
BASE_URL="${RAW_URL%/}"
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
  "/unknown-route-404"
)

for ((i = 1; i <= ITERATIONS; i++)); do
  for ROUTE in "${ROUTES[@]}"; do
    # 2 parallel requests per route per tick to simulate realistic user concurrency
    curl -s -k -o /dev/null -w "%{http_code} %{time_total}s -> ${ROUTE}\n" "${BASE_URL}${ROUTE}" || true &
    curl -s -k -o /dev/null "${BASE_URL}${ROUTE}" || true &
  done
  wait
  sleep 0.2
done

echo ""
echo "✅ Finished traffic generation. Check Grafana at ${BASE_URL}/monitoring or http://localhost:3001"
