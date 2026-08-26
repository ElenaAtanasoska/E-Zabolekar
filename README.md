# E-Zabolekar (Digital Dental Clinic Management System)

> A modular, full-stack web application designed to digitize and streamline dental clinic workflows, patient health records, and visual diagnostics. 

> **Developed as a university diploma thesis project.**

---

## About the Project

Modern dental practices handle large volumes of daily patient data, medical histories, and administrative tasks. Traditional paper based records and fragmented systems often lead to inefficiencies, data loss, and slower decision making. 

**E-Zabolekar** is an enterprise grade, cloud native web application built to centralize and modernize dental clinic management. It provides role based access for clinic administrators and dentists, comprehensive patient tracking, medical/allergy histories, and an interactive 3D dental chart for visual diagnostics.

---

## Key Features

- **Role-Based Access Control (RBAC):** Admins manage doctor accounts and system configurations; dentists maintain patient files and treatment logs.
- **Patient Management & Dossier:** Secure registration, unique identification generation, blood types, chronic conditions, and active therapies.
- **Interactive 3D Dental Chart:** Visual tracking of individual tooth conditions, historical interventions, and status updates using 3D rendering.
- **X-Ray & Media Storage:** Secure medical image handling and cloud media management.
- **Automated Infrastructure (IaC):** Declarative cloud architecture deployed on Microsoft Azure using Terraform.

---

## Tech Stack

### Frontend
- **Framework:** React, Vite (Single Page Application architecture)
- **Routing & HTTP:** React Router, Axios
- **Styling:** Tailwind CSS
- **3D Graphics:** Three.js, React Three Fiber, Drei

### Backend
- **Language & Framework:** Python, FastAPI (RESTful API architecture)
- **Database ORM:** SQLAlchemy
- **Authentication:** OAuth2 with JWT (JSON Web Tokens), Passlib (BCrypt hashing)

### Cloud, DevOps & Infrastructure
- **Cloud Provider:** Microsoft Azure
- **Container Orchestration:** Azure Kubernetes Service (AKS)
- **Database:** Azure Database for PostgreSQL (Flexible Server)
- **Infrastructure as Code:** Terraform
- **Secret Management:** Azure Key Vault
- **Media Hosting:** Cloudinary

---

## System Architecture & Design

### Cloud & DevOps Infrastructure
The entire infrastructure follows the **Infrastructure as Code (IaC)** paradigm using Terraform to ensure consistency and eliminate manual configuration drift:
- **Compute:** Deployed on **Azure Kubernetes Service (AKS)** using `Standard_D2s_v3` node pools for high availability and self-healing scaling.
- **Persistence:** **Azure Database for PostgreSQL (Flexible Server)** configured with ACID compliance and automated backups.
- **Security:** **Azure Key Vault** handles secret management securely without exposing credentials in environment files or source code, coupled with RBAC and Managed Identities.

---
