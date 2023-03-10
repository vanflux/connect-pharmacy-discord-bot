FROM node:16.14.0-alpine3.14
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install --network-timeout 1000000 --frozen-lockfile --ignore-scripts --no-optional --no-cache && yarn cache clean
COPY tsconfig.json .
COPY src/ src/
RUN yarn build
ENV DATA_DIR=/data
ENV NODE_ENV=production
ARG VERSION
ENV VERSION=$VERSION
ENTRYPOINT ["node", "dist/index"]
