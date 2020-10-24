FROM node:12.18-alpine

ENV PORT=8100

# WORKDIR /src/private_films

# cache node_modules
# RUN mkdir -p /tmp/private_films
# ADD package.json /tmp/private_films/package.json
# RUN cd /tmp/private_films && npm install
# RUN mkdir -p /src/private_films && cp -a /tmp/private_films/node_modules /src/private_films/
ADD package.json /src/private_films/fe_user
WORKDIR /src/private_films/fe_user
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8100

CMD "npm" "run" "dev:ssr"
