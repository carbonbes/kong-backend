FROM node:24.0.0-alpine AS base

WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn --immutable

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn prisma generate
RUN yarn build
RUN yarn workspaces focus --production

FROM base AS runtime

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000

USER node

CMD ["node", "dist/src/main"]
