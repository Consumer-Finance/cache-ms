FROM node:23.6.0-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

FROM node:23.6.0-alpine AS build
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm ci -f --only=production && npm cache clean --force

FROM node:23.6.0-alpine AS prod
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

USER node
CMD ["node", "dist/main.js"]