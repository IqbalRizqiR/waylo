import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 10 },  // Warmup / Baseline (P10)
    { duration: "60s", target: 50 },  // Nominal Load (P50 & RPS ramp)
    { duration: "30s", target: 100 }, // Peak Stress & Spike (P95/P99 latency)
    { duration: "20s", target: 0 },   // Cooldown
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // SLA < 2s
    http_req_failed: ["rate<0.10"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";

const ROUTES = [
  { path: "/health", weight: 20 },
  { path: "/jobs", weight: 25 },
  { path: "/careers", weight: 15 },
  { path: "/skills", weight: 15 },
  { path: "/learner/profile", weight: 5 },
  { path: "/api/dashboard/public-stats", weight: 5 },
  { path: "/api/curriculum/certifications", weight: 5 },
  { path: "/api/curriculum/expertise", weight: 4 },
  { path: "/api/bot/intents", weight: 3 },
  { path: "/api/dashboard/visitors", weight: 3 },
  { path: "/api/unknown-endpoint", weight: 3 }, // Produces 404s for status code panel
];

function pickRandomRoute() {
  const totalWeight = ROUTES.reduce((acc, r) => acc + r.weight, 0);
  let random = Math.random() * totalWeight;
  for (const route of ROUTES) {
    if (random < route.weight) {
      return route.path;
    }
    random -= route.weight;
  }
  return ROUTES[0].path;
}

export default function () {
  const route = pickRandomRoute();
  const url = `${BASE_URL}${route}`;

  const res = http.get(url, {
    tags: { route },
    timeout: "5s",
  });

  check(res, {
    "status is acceptable": (r) => [200, 204, 404, 429].includes(r.status),
  });

  // Random pacing between requests (50ms - 250ms)
  sleep(Math.random() * 0.2 + 0.05);
}
