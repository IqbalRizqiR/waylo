import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "nodejs_",
});

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests processed",
  labelNames: ["method", "route", "status"] as const,
  registers: [register],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 0.8, 1.0, 1.5, 2.0, 5.0],
  registers: [register],
});

export const httpRateLimitBlocksTotal = new client.Counter({
  name: "http_rate_limit_blocks_total",
  help: "Total number of requests blocked by rate limiters",
  labelNames: ["route"] as const,
  registers: [register],
});

export const ragQueryCacheHitsTotal = new client.Counter({
  name: "rag_query_cache_hits_total",
  help: "Total number of RAG query cache hits",
  registers: [register],
});

export const ragQueryCacheMissesTotal = new client.Counter({
  name: "rag_query_cache_misses_total",
  help: "Total number of RAG query cache misses",
  registers: [register],
});

export const ragSearchDurationSeconds = new client.Histogram({
  name: "rag_search_duration_seconds",
  help: "Duration of RAG search queries in seconds",
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0],
  registers: [register],
});

export const ragKnowledgeChunksTotal = new client.Gauge({
  name: "rag_knowledge_chunks_total",
  help: "Total indexed knowledge chunks in the vector store",
  registers: [register],
});

export const embeddingApiCallsTotal = new client.Counter({
  name: "embedding_api_calls_total",
  help: "Total embedding API calls triggered",
  registers: [register],
});
