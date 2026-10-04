#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo "🚀 Running Grafana k6 Load Test"
echo "=================================================="

if command -v k6 &> /dev/null; then
  echo "Found local k6 installation. Executing locally against http://localhost:4000..."
  BASE_URL="http://localhost:4000" k6 run scripts/k6-load-test.js
else
  echo "Local k6 not found. Executing k6 inside Docker Compose container..."
  docker compose --profile loadtest run --rm k6 run /scripts/k6-load-test.js
fi

echo ""
echo "✅ Load test completed. Inspect metrics in Grafana: http://localhost:3001"
