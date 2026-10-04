FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY waylo-fe/package.json ./waylo-fe/
RUN npm install --prefix packages/shared
RUN npm install --prefix waylo-fe

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/waylo-fe/node_modules ./waylo-fe/node_modules
COPY packages/shared ./packages/shared
COPY waylo-fe ./waylo-fe
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
WORKDIR /app/waylo-fe
RUN npm run build

FROM base AS runner
WORKDIR /app/waylo-fe
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/waylo-fe /app/waylo-fe

EXPOSE 3000
CMD ["npm", "start"]
