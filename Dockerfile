FROM node:18-alpine

WORKDIR /app

# Habilitar Corepack
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

# Copiar package files
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build
RUN pnpm build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "start"]