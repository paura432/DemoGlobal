# ============================================
# ETAPA 1: BASE
# ============================================
FROM node:20-alpine AS base

# Instalar pnpm globalmente
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ============================================
# ETAPA 2: DEPS (Dependencias)
# ============================================
FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias de pnpm
COPY package.json pnpm-lock.yaml .npmrc* ./

# pnpm install frozen-lockfile: Instala exactamente lo del lock
# --prod=false: Instala también devDependencies (necesarias para build)
RUN pnpm install --frozen-lockfile --prod=false

# ============================================
# ETAPA 3: BUILDER (Constructor)
# ============================================
FROM base AS builder
WORKDIR /app

# Copiar node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar TODO el código fuente
COPY . .

# Variables de entorno para el BUILD
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_VCS_API_URL=https://vcs.trustos.telefonicatech.com:9443
ENV NEXT_PUBLIC_ENV_MODE=prod

# Build con Turbopack
RUN pnpm run build

# ============================================
# ETAPA 4: RUNNER (Producción)
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]