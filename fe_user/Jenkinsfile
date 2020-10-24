pipeline {

  agent none

  environment {
    DOCKER_IMAGE = "private_films/fe_user"
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
        sh "docker rmi ${DOCKER_IMAGE}:build || true"
        sh "docker build -t ${DOCKER_IMAGE}:build . "
      }
    }

    stage("deploy") {
        agent { node {label 'master'}}
        environment {
          DOCKER_USER_ID = 1003
          DOCKER_GROUP_ID = 983
          DOCKER_PORT = 8100
          CONTAINER_NAME = "private_film_fe"
        }
        steps {
          // kill container name by image
          sh "docker ps -a | awk '{ print \$1,\$2 }' | grep ${DOCKER_IMAGE} | awk '{print \$1 }' | xargs -I {} docker rm -f {}"

          // remove image lastest
          sh "docker rmi ${DOCKER_IMAGE}:latest || true"

          // tag images version build -> latest
          sh "docker tag ${DOCKER_IMAGE}:build ${DOCKER_IMAGE}:latest"

          //  -v \"`pwd`/data\":/var/ckcapi_home

          // run images latest
          sh "docker run -v /var/run/docker.sock:/var/run/docker.sock -p ${DOCKER_PORT}:80 --user ${DOCKER_USER_ID}:${DOCKER_GROUP_ID} --name ${CONTAINER_NAME} -d ${DOCKER_IMAGE}:latest"
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
