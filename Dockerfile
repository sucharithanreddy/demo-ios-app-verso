FROM oven/bun:1

WORKDIR /app

# Copy package files first
COPY package.json bun.lockb* ./

# Copy Prisma schema before install (needed for postinstall hook)
COPY prisma ./prisma

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build
RUN bun run build

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start
CMD ["bun", "run", "start"]
