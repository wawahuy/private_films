pipeline {

  agent none

  environment {
    DOCKER_IMAGE = "private_films/server_manager"
  }

  stages {

    // stage("Test") {
    //   agent {
    //       docker {
    //         image 'node:12.18-alpine'
    //         args '-u 0:0 -v /tmp:/root/.cache'
    //       }
    //   }
    //   steps {
    //     sh "npm install"
    //     sh "npm run test"
    //   }
    // }

    stage("build") {
      agent { node {label 'master'}}
      steps {
        // sh "docker rmi ${DOCKER_IMAGE}:build || true"
        // sh "docker build -t ${DOCKER_IMAGE}:build . "
        sh "chmod +x -R \"${env.WORKSPACE}\""
        sh "./bash-docker-down.sh"
        sh "docker rmi ${DOCKER_IMAGE}:lasted || true"
        sh "docker build -t ${DOCKER_IMAGE}:lasted . "
      }
    }

    stage("deploy") {
        agent { node {label 'master'}}
        environment {
          DOCKER_USER_ID = 1003
          DOCKER_GROUP_ID = 983
          DOCKER_PORT = 8003
          CONTAINER_NAME = "private_films_server_manager"
        }
        steps {
          // // kill container name by image
          // sh "docker ps -a | awk '{ print \$1,\$2 }' | grep ${DOCKER_IMAGE} | awk '{print \$1 }' | xargs -I {} docker rm -f {}"

          // // remove image lastest
          // sh "docker rmi ${DOCKER_IMAGE}:latest || true"

          // // tag images version build -> latest
          // sh "docker tag ${DOCKER_IMAGE}:build ${DOCKER_IMAGE}:latest"

          // //  -v \"`pwd`/data\":/var/ckcapi_home

          // // run images latest
          // sh "docker run -v /var/run/docker.sock:/var/run/docker.sock -p ${DOCKER_PORT}:${DOCKER_PORT} --user ${DOCKER_USER_ID}:${DOCKER_GROUP_ID} --name ${CONTAINER_NAME} -d ${DOCKER_IMAGE}:latest"
          sh "chmod +x -R \"${env.WORKSPACE}\""
          sh "./bash-docker-start.sh"
        }
    }
  }

  post {
    success {
      echo "SUCCESSFUL"
    }
    failure {
      echo "FAILED"
    }
  }
}
