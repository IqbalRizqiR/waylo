FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
WORKDIR /app
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY waylo-be/package.json ./waylo-be/
RUN npm install --prefix packages/shared
RUN npm install --prefix waylo-be

FROM base AS builder
WORKDIR /app
COPY packages/shared ./packages/shared
COPY waylo-be ./waylo-be
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/waylo-be/node_modules ./waylo-be/node_modules
WORKDIR /app/waylo-be
RUN npx prisma generate
RUN npx esbuild src/server.ts --bundle --platform=node --target=node20 --format=esm --packages=external --outfile=dist/server.js

FROM base AS runner
WORKDIR /app/waylo-be
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/waylo-be /app/waylo-be

EXPOSE 4000
CMD ["node", "dist/server.js"]
