pipeline {
    agent {
        label 'test_server'
    }

    environment {
        APP_NAME        = "wheel-of-names"
        DEPLOY_PATH     = "/var/www/html/${APP_NAME}"
        BUILD_FOLDER    = "dist" 
        INSTALL_CMD     = "npm install"
        BUILD_CMD       = "npm run build"
    }

    stages {
        stage('Check Environment') {
            steps {
                echo "--- Kiểm tra phiên bản Node & NPM ---"
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "--- Đang cài đặt thư viện (npm install) ---"
                sh "${INSTALL_CMD}"
            }
        }

        stage('Build Production') {
            steps {
                echo "--- Đang biên dịch dự án Vite ---"
                sh "${BUILD_CMD}"
            }
        }

        stage('Deploy to Nginx') {
            steps {
                echo "--- Bắt đầu triển khai lên Nginx ---"
                script {
                    sh "sudo mkdir -p ${DEPLOY_PATH}"
                    
                    sh "sudo rm -rf ${DEPLOY_PATH}/*"
                    
                    sh "sudo cp -r ${BUILD_FOLDER}/* ${DEPLOY_PATH}/"
                    
                    sh "sudo chown -R www-data:www-data ${DEPLOY_PATH}"
                    
                    sh "sudo systemctl reload nginx"
                }
            }
        }
    }

    post {
        success {
            echo "Triển khai thành công ứng dụng: ${APP_NAME}"
        }
        failure {
            echo "Build thất bại! Vui lòng kiểm tra lại Console Log."
        }
        always {
            echo "--- Dọn dẹp Workspace ---"
            cleanWs() // Xóa code thừa trên Agent để tiết kiệm dung lượng ổ cứng
        }
    }
}