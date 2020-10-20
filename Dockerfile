FROM node:12.18-alpine

ENV PORT=8001

# WORKDIR /src/private_films

# cache node_modules
# RUN mkdir -p /tmp/private_films
# ADD package.json /tmp/private_films/package.json
# RUN cd /tmp/private_films && npm install
# RUN mkdir -p /src/private_films && cp -a /tmp/private_films/node_modules /src/private_films/
ADD package.json /src/private_films
WORKDIR /src/private_films
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8001

CMD "npm" "run" "staging"
