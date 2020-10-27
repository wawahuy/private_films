FROM node:12.18-alpine

ENV PORT=8003

WORKDIR /src/private_films_server_manager

# cache node_modules
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8003

CMD "npm" "run" "staging"
