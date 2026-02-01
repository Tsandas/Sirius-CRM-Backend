## Description

This repository contains the **backend REST API for a university CRM system (Sirius CRM)**. It serves as the core API layer for the platform.

The backend is built with **Node.js and Express**, using a **JWT-based authentication system with refresh tokens stored in Redis**, centralized error handling, CORS with credentials, and IP-based rate limiting.

This API is part of a larger ecosystem that includes:

* A main web application for the CRM users.
* A separate **Sysadmin web application** for managing users and system operations.
* Background services for email ingestion and processing.
* Observability and monitoring infrastructure.

### Deployment & Infrastructure (high level)

The system runs in **two environments: Testing and Production** with near-parity architecture.

**CI/CD Pipeline:**

* Automated unit tests
* Testing Enviroment deployment
* End-to-end (E2E) tests on testing enviroment
* Docker image build
* Image push to AWS ECR
* Automated deployment to AWS EC2 as a containerized service

**Production (AWS):**

* **Compute:** EC2 running containerized services
* **Database:** AWS RDS (PostgreSQL)
* **Cache:** AWS ElastiCache (Redis) for refresh tokens
* **Edge & TLS:** AWS CloudFront + AWS Certificate Manager
* **DNS:** Route 53
* **Background processing:** AWS Lambda + EventBridge for email ingestion
* **Monitoring & observability:**

  * Nginx (reverse proxy, CloudFront origin validation)
  * Prometheus
  * cAdvisor (container metrics)
  * Node Exporter
  * AWS CloudWatch (default metrics)

https://miro.com/app/board/uXjVJtvZsJE=/?share_link_id=596949466968
![AWS Env](./docs/Sirius-Prod.png)


**Testing Environment:**
![AWS Env](./docs/Sirius-Test.png)


* Mirrors production architecture at a smaller scale on an alternative cloud provider.

### Design Philosophy & Future Direction

The system is designed with modularity and scalability in mind. While currently deployed as containerized services on EC2, the architecture is structured to allow a future migration to **Kubernetes**, where:

* Express API, PostgreSQL, and Redis can run as containerized services
* Multi-tenant deployments for multiple clients become feasible
* Scaling and resilience can be managed at the orchestration layer

---
