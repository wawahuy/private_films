docker-compose stop
docker-compose rm -f

# fix
mkdir -p .docker/data/mongodb
sudo chmod -R go+w .docker/data/mongodb

docker rmi private_films/server_manager:lasted || true
docker tag private_films/server_manager:build private_films/server_manager:lasted

docker-compose up -d
