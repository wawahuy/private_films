DIR="~/sever_manager"
cd "$DIR"
chmod u+x ./bash-deploy.sh && ./bash-deploy.sh

docker-compose stop
docker-compose rm -f
docker-compose up -d
