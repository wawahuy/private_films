pipeline {

  agent none

  environment {
    DOCKER_IMAGE = "private_films/server_manager"
    // 1003/983
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
      environment {
        DOCKER_TAG="${GIT_BRANCH.tokenize('/').pop()}-${GIT_COMMIT.substring(0,7)}"
      }
      steps {
        // sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} . "
        // sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
        // sh "docker image ls | grep ${DOCKER_IMAGE}"
        // withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
        //     sh 'echo $DOCKER_PASSWORD | docker login --username $DOCKER_USERNAME --password-stdin'
        //     sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
        //     sh "docker push ${DOCKER_IMAGE}:latest"
        // }

        // //clean to save disk
        // sh "docker image rm ${DOCKER_IMAGE}:${DOCKER_TAG}"
        // sh "docker image rm ${DOCKER_IMAGE}:latest"

        sh "docker rmi ${DOCKER_IMAGE}:build || true"
        sh "docker build -t ${DOCKER_IMAGE}:build ."
      }
    }


    stage("deploy") {
      agent { node {label 'master'}}
      environment {
        DOCKER_TAG="${GIT_BRANCH.tokenize('/').pop()}-${GIT_COMMIT.substring(0,7)}"
        SSH_AUTH="allstaging@103.130.218.177"
        CONNECT="ssh -o StrictHostKeyChecking=no ${SSH_AUTH}"
        DIR="~/server_manager"
      }
      steps {
        sshagent(credentials : ['SSH_ALL_STAGING']) {
          sh "${CONNECT} 'mkdir -p ${DIR}' || true"
          sh "scp -r -o StrictHostKeyChecking=no \"${env.WORKSPACE}/docker-compose.yml\" ${SSH_AUTH}:${DIR}"
          sh "scp -r -o StrictHostKeyChecking=no \"${env.WORKSPACE}/bash-deploy.sh\" ${SSH_AUTH}:${DIR}"

          sh "${CONNECT} 'cd ${DIR} && chmod u+x ./bash-deploy.sh'"
          sh "${CONNECT} 'cd ${DIR} && ./bash-deploy.sh'"
        }
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
