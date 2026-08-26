# Technical Decisions & Architectural Rationale

## Executive Summary
This document outlines the technical architecture, design decisions, prompt engineering strategy, database schema design, business logic guardrails, and cloud deployment configuration for the **AI Lead Qualification & Decision Engine (LeadPulse AI)**.

---

## 1. Technology Stack Decisions

### Backend: Java 17 & Spring Boot 3
- **Rationale**: Java Spring Boot 3 delivers an enterprise-grade REST backend with strict typing, robust transaction management, and standard layered architecture (Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ JPA Entities).
- **Spring Data JPA & Hibernate**: Simplifies database interaction, executes database-level group aggregations (`countLeadsByBudgetRange`), and ensures schema migration safety.
- **Spring Validation & Lombok**: Enforces strict server-side validation on inbound lead payload DTOs (`@Valid`, `@NotBlank`, `@Size`).

### Frontend: React 18 + TypeScript + Vite + TailwindCSS
- **Rationale**: Vite provides instantaneous HMR (Hot Module Replacement) and fast production bundling (gzip ~74 kB). React 18 with TypeScript ensures zero type mismatches between frontend services and backend Spring Boot DTO contracts.
- **Dark Enterprise AI Design System**: Inspired by Linear and Vercel aesthetics, using dark neutral surfaces (`#080D1A`, `#0F172A`), crisp borders (`#243047`), 12px card corners, 8px control radiuses, hero score gauges (`96 / 100`), and next-best action decision engine widgets.

### Database: MySQL 8.0 (Hosted on Aiven Cloud with SSL)
- **Rationale**: Relational integrity for storing company profiles, lead submissions, structured AI response payloads, and audit timestamps.
- **36-Character String UUIDs**: Annotated JPA entity primary keys with `@JdbcTypeCode(SqlTypes.VARCHAR)` so `id` stores clean 36-character string UUIDs (`9b9e1a62-5976-4334-b4ee-07ba7b4caa01`) rather than binary `BLOB` icons in SQL Workbench.
- **Duplicate Prevention**: Enforced a `UNIQUE KEY idx_leads_website_url (website_url(255))` constraint. Duplicate domain attempts trigger an HTTP 409 Conflict REST error response with an inline modal alert, preventing page redirects.

---

## 2. AI Model & Qualification Engine Strategy

### Prompt Engineering & Structured JSON Output
The application leverages **Google Gemini 1.5 Flash** (with secondary fallback to **OpenAI GPT-4o-mini**) using low temperature (`0.2`) and strict system instructions to guarantee JSON responses:

```json
{
  "qualification": "HIGH" | "MEDIUM" | "LOW",
  "score": 0 - 100,
  "reasoning": "Detailed 2-3 sentence explanation of why this lead fits target criteria...",
  "missingInformation": [
    "Identified unstated technical or procurement detail 1",
    "Identified unstated technical or procurement detail 2"
  ],
  "recommendedAction": "Specific actionable next step for the growth team...",
  "keyInsights": [
    "Key strength or risk factor 1",
    "Key strength or risk factor 2"
  ]
}
```

### 3-Tier Resilient AI Execution Pipeline (Zero-Downtime Guarantee)
To guarantee the application **never fails** even if external cloud LLM APIs are rate-limited, expired, or unavailable:
1. **Primary Model**: Google Gemini 1.5 Flash (`gemini-1.5-flash`).
2. **Secondary Model**: OpenAI GPT-4o-mini (`gpt-4o-mini`).
3. **Guaranteed Local Engine**: Resilient rule-based Heuristic AI Engine executing locally with zero API dependencies.

```
+-------------------+        Fallback        +-------------------+        Fallback        +-------------------+
|  Google Gemini    |  ------------------->  |   OpenAI GPT-4o   |  ------------------->  |  Local Heuristic  |
|   1.5 Flash API   |     (Rate Limit/Err)   |      mini API     |     (No Key/Timeout)   |  AI Engine (Local)|
+-------------------+                        +-------------------+                        +-------------------+
```

### Business Logic Guardrails (Enterprise Budget Hard Cap)
During testing, long goal texts containing strategic keywords (`migrate`, `scale`) were inflating scores for low-budget leads. I implemented a strict business domain rule:
- **Low Budget Enterprise Cap**: If an enterprise service (*Enterprise Cloud Migration & DevOps*, *Custom AI Model Training*, *Fullstack Web Application*, *Cybersecurity & Audit*) has a budget tier of `Under $5,000` or `Under $1,000`, the score is **HARD CAPPED at MAX 38 / 100 (`LOW FIT`)**.
- **High Intent Requirement**: `HIGH FIT` (75–98) is strictly reserved for leads with verified enterprise buying power ($25,000+ to $50,000+).

---

## 3. Database Schema Architecture (MySQL 8.0)

```sql
USE lead_qualifier;

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    service_interest VARCHAR(255) NOT NULL,
    budget_range VARCHAR(100) NOT NULL,
    goal TEXT NOT NULL,
    
    qualification VARCHAR(20) NOT NULL CHECK (qualification IN ('HIGH', 'MEDIUM', 'LOW')),
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    reasoning TEXT NOT NULL,
    missing_information TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    key_insights TEXT NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_leads_qualification (qualification),
    INDEX idx_leads_created_at (created_at DESC),
    INDEX idx_leads_company_name (company_name),
    UNIQUE KEY idx_leads_website_url (website_url(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Key Trade-offs & Architecture Decisions

| Decision | Trade-off Made | Why This Was Chosen |
| :--- | :--- | :--- |
| **Dual Decoupled Repositories (`lead-qualifier-BE` & `lead-qualifier-FE`)** | Requires separate deployment pipelines | Allows independent scaling on Render (Backend REST API) and Vercel (Frontend CDN Edge). |
| **Self-Healing `DataSourceConfig`** | Adds custom backend connection parsing | Automatically converts raw cloud URIs (`mysql://` $\rightarrow$ `jdbc:mysql://`) and normalizes parameter flags (`ssl-mode` $\rightarrow$ `sslMode`). |
| **Zero-RAM Database Aggregation** | Requires custom JPA `@Query` methods | Prevents OutOfMemory errors by running `GROUP BY` counts inside MySQL 8 index memory instead of Java RAM. |
| **In-Modal Alert System** | Requires client error parsing in `api.ts` | Displays inline rejection alerts (e.g. 409 Duplicate URL) without wiping form inputs or causing unwanted page redirects. |

---

## 5. Live Production Deployment Endpoints

- 🌐 **Live Frontend Application**: [https://ai-lead-qualifier-fe.vercel.app/](https://ai-lead-qualifier-fe.vercel.app/)
- ⚙️ **Live Backend REST API**: [https://ai-lead-qualifier-be.onrender.com](https://ai-lead-qualifier-be.onrender.com)
- 🗄️ **Live Cloud Database**: Aiven MySQL 8.0 (`jdbc:mysql://mysql-8ae8ba2-ai-lead-qualifier.g.aivencloud.com:19383/lead_qualifier?sslMode=REQUIRED`)
- 📦 **GitHub Repositories**:
  - Backend: [https://github.com/ashukale1608/ai-lead-qualifier-BE](https://github.com/ashukale1608/ai-lead-qualifier-BE)
  - Frontend: [https://github.com/ashukale1608/ai-lead-qualifier-FE](https://github.com/ashukale1608/ai-lead-qualifier-FE)
