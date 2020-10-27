FROM node:12.18-alpine

ENV PORT=8003

WORKDIR /src/private_films_server_manager

# cache node_modules
# RUN mkdir -p /tmp/private_films_server_manager
# ADD package.json /tmp/private_films_server_manager/package.json
# RUN cd /tmp/private_films_server_manager && npm install
# RUN mkdir -p /src/private_films_server_manager && cp -a /tmp/private_films_server_manager/node_modules /src/private_films_server_manager/

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8003

CMD "npm" "run" "staging"
