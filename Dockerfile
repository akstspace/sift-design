# Sift Design website: the guide, live blocks, and the raw reference for agents.
#   docker build -t sift-design .
#   docker run --rm -p 8080:8080 sift-design      ->  http://localhost:8080

FROM node:24-alpine AS build
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    npm_config_audit=false \
    npm_config_fund=false
# Install from the lockfile first so dependency layers cache between builds.
COPY package.json package-lock.json ./
COPY tokens/package.json tokens/
COPY packages/ui/package.json packages/ui/
COPY site/package.json site/
COPY specimen/package.json specimen/
COPY blocks/workbench/package.json blocks/workbench/
COPY blocks/routines/package.json blocks/routines/
COPY blocks/timeline/package.json blocks/timeline/
COPY blocks/assistant/package.json blocks/assistant/
COPY blocks/onboarding/package.json blocks/onboarding/
RUN npm ci
COPY . .
RUN node scripts/build-site.mjs

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/site/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/llms.txt >/dev/null || exit 1
