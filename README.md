# AI Lead Qualification & Decision Engine (LeadPulse AI)

An enterprise-grade, AI-powered web application built with **Java 17 (Spring Boot 3)**, **MySQL 8.0 (Aiven Cloud)**, and **React 18 (TypeScript + Vite + TailwindCSS)**. The tool allows sales and growth teams to qualify inbound website leads using AI analysis to return fit scores (**High**, **Medium**, **Low**), detailed reasoning, missing information checklists, and recommended next best actions.

---

## 🌟 Key Features

1. **AI Lead Qualification**: Analyzes company details, website URL, service interest, budget tier, and strategic goals.
2. **Structured Analysis**: Returns qualification tier (**HIGH**, **MEDIUM**, **LOW**), score (0-100), reasoning breakdown, missing information checklist, and next-best actions.
3. **3-Tier Resilient Architecture**: Integrated with **Google Gemini API** and **OpenAI API** with a built-in **Heuristic AI Engine fallback** guaranteeing zero downtime even if cloud API keys are expired or absent.
4. **Enterprise Budget Hard-Capping**: Low budgets (`Under $5,000` / `Under $1,000`) for high-cost enterprise services are hard-capped at MAX 38 / 100 (`LOW FIT`), preventing text length bonuses from misclassifying low-budget prospects.
5. **MySQL 8.0 Data Persistence**: Saves all lead submissions, audit timestamps, and AI metrics in MySQL 8.0 (`leads` table) with 36-character string UUIDs (`VARCHAR(36)`).
6. **Duplicate Lead Prevention**: Unique index on `website_url` prevents duplicate domain submissions, returning HTTP 409 Conflict with inline modal alerts.
7. **Leads History Dashboard**: Filter leads by High/Medium/Low fit, search by domain/company name, and view real-time aggregate stats computed via database `GROUP BY` queries.
8. **In-App Architecture Snapshot**: Interactive modal exposing the MySQL 8 schema DDL (`schema.sql`) and system design specs directly to evaluators.

---

## 📁 Repository Structure

```
.
├── lead-qualifier-backend/          # Java Spring Boot 3 REST API (Standalone Repository)
│   ├── Dockerfile                  # Multi-stage Dockerfile (Java 17 JRE)
│   ├── docker-compose.yml          # Standalone Backend + MySQL 8 Docker Compose
│   ├── .dockerignore               # Backend Docker ignore rules
│   ├── .gitignore                  # Backend Git ignore rules
│   ├── schema.sql                  # MySQL 8 Database DDL & Seed Data
│   ├── AI_Lead_Qualifier_APIs.postman_collection.json # Postman API Collection
│   └── src/main/java/com/leadqualifier/
├── lead-qualifier-frontend/         # React 18 Web App (Standalone Repository)
│   ├── Dockerfile                  # Multi-stage Dockerfile (Node 20 + Nginx)
│   ├── docker-compose.yml          # Standalone Frontend Docker Compose
│   ├── .dockerignore               # Frontend Docker ignore rules
│   ├── .gitignore                  # Frontend Git ignore rules
│   ├── nginx.conf                  # Nginx Web Server SPA routing config
│   └── src/
├── DB_Architecture_Snapshot.md     # DB Architecture Document
├── DB_Architecture_Snapshot.pdf    # PDF Document for Form Submission
├── TECHNICAL_DECISIONS.md          # Architectural Decisions Writeup
└── README.md
```

---

## 🐙 Separate GitHub Repositories

Both services are fully containerized and self-contained with their own `.gitignore`, `Dockerfile`, and `docker-compose.yml`.

- **Backend Repository**: [https://github.com/ashukale1608/ai-lead-qualifier-BE](https://github.com/ashukale1608/ai-lead-qualifier-BE)
- **Frontend Repository**: [https://github.com/ashukale1608/ai-lead-qualifier-FE](https://github.com/ashukale1608/ai-lead-qualifier-FE)

---

## 🚀 Live Production Endpoints

- 🌐 **Live Frontend Application**: [https://ai-lead-qualifier-fe.vercel.app/](https://ai-lead-qualifier-fe.vercel.app/)
- ⚙️ **Live Backend REST API**: [https://ai-lead-qualifier-be.onrender.com](https://ai-lead-qualifier-be.onrender.com)
- 🗄️ **Live Cloud Database**: Aiven MySQL 8.0 (`jdbc:mysql://mysql-8ae8ba2-ai-lead-qualifier.g.aivencloud.com:19383/lead_qualifier?sslMode=REQUIRED`)

---

## 🐳 Quick Start with Docker Compose

Run either service standalone via Docker:

```bash
# Backend + MySQL 8.0
cd lead-qualifier-backend
docker compose up --build

# Frontend (React + Nginx)
cd lead-qualifier-frontend
docker compose up --build
```

- **React Web App**: Open [http://localhost:3000](http://localhost:3000)
- **Spring Boot REST API**: Running on [http://localhost:8080](http://localhost:8080)
- **MySQL Database**: Running on port `3306`

---

## 🚀 How to Run Locally (Manual)

### Prerequisites
- **Java 17+**
- **Node.js 18+** & `npm`
- **MySQL 8.0+** (running on localhost:3306)

---

### Step 1: Database Setup (MySQL 8.0)
Ensure MySQL 8.0 is running locally on port `3306` with database `lead_qualifier`.

Run `schema.sql` in MySQL Workbench or execute:
```sql
CREATE DATABASE IF NOT EXISTS lead_qualifier;
USE lead_qualifier;
-- Run schema.sql script
```

---

### Step 2: Start Java Spring Boot Backend
```bash
cd lead-qualifier-backend

# On Windows
mvnw.cmd spring-boot:run

# Or with system Maven
mvn spring-boot:run
```
The REST API server will start on **http://localhost:8080**.

---

### Step 3: Start React Frontend
In a new terminal window:
```bash
cd lead-qualifier-frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 📄 Deliverables Checklist

- [x] **Live application URL**: [https://ai-lead-qualifier-fe.vercel.app/](https://ai-lead-qualifier-fe.vercel.app/)
- [x] **GitHub repository URLs**: [Backend Repo](https://github.com/ashukale1608/ai-lead-qualifier-BE) & [Frontend Repo](https://github.com/ashukale1608/ai-lead-qualifier-FE)
- [x] **Database structure/architecture snapshot**: `DB_Architecture_Snapshot.pdf` & `schema.sql`.
- [x] **Technical decisions explanation**: `TECHNICAL_DECISIONS.md`.
- [x] **Postman API Collection**: `AI_Lead_Qualifier_APIs.postman_collection.json`.
