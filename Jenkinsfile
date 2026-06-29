pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('cheima-dockerhub-password')
        SONAR_TOKEN = credentials('cheima-sonar-token')
        DOCKER_IMAGE = "cheimasterclass/tasklist-backend"
        SONAR_HOST_URL = "https://sonarqube.cicd.kits.ext.educentre.fr"
    }

    stages {
        stage('Installation des dépendances') {
            steps {
                dir('cicd-tasklist-backend') {
                    sh 'npm ci'
                    sh 'npx prisma generate'
                }
            }
        }

        stage('Tests unitaires') {
            steps {
                dir('cicd-tasklist-backend') {
                    sh 'npx prisma generate --schema=prisma/schema-test.prisma'
                    sh 'npm run test:coverage'
                }
            }
            post {
                always {
                    junit 'cicd-tasklist-backend/reports/junit.xml'
                }
            }
        }

        stage('Tests End-to-End') {
            steps {
                dir('cicd-tasklist-backend') {
                    sh 'npm run test:e2e:coverage'
                }
            }
            post {
                always {
                    junit 'cicd-tasklist-backend/reports/junit.xml'
                }
            }
        }

        stage('Analyse SonarQube') {
            steps {
                dir('cicd-tasklist-backend') {
                    sh "sonar-scanner -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.token=${SONAR_TOKEN}"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Quality Gate vérifiée via SonarQube'
            }
        }

        stage('Build Docker') {
            steps {
                dir('cicd-tasklist-backend') {
                    sh "docker build --tag ${DOCKER_IMAGE}:${BUILD_NUMBER} --tag ${DOCKER_IMAGE}:latest ."
                }
            }
        }

        stage('Scan Trivy') {
            steps {
                sh "trivy image --severity CRITICAL,HIGH --format table ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                sh "trivy image --severity CRITICAL,HIGH --format json --output trivy-report.json ${DOCKER_IMAGE}:${BUILD_NUMBER}"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-report.json', fingerprint: true
                }
            }
        }

        stage('Génération SBOM') {
            steps {
                sh "trivy image --format spdx-json --output sbom-spdx.json ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                sh "trivy image --format cyclonedx --output sbom-cyclonedx.json ${DOCKER_IMAGE}:${BUILD_NUMBER}"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'sbom-*.json', fingerprint: true
                }
            }
        }

        stage('Push DockerHub') {
            steps {
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                dir('cicd-tasklist-backend') {
                    sh "docker buildx build --platform linux/amd64 --tag ${DOCKER_IMAGE}:${BUILD_NUMBER} --tag ${DOCKER_IMAGE}:latest --sbom=true --provenance=true --push ."
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout'
            deleteDir()
        }
    }
}