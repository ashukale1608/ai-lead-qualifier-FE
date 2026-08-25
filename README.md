# Lead Qualifier Frontend Web App

A modern, dark-mode B2B lead qualification web interface built with **React 18**, **TypeScript**, **Vite**, and **TailwindCSS**.

---

## 📁 Repository Structure

```
lead-qualifier-frontend/
├── package.json                            # Project dependencies & scripts
├── vite.config.ts                          # Vite configuration
├── Dockerfile                              # Multi-stage Dockerfile (Node 20 + Nginx)
├── nginx.conf                              # Nginx SPA web server config
├── docker-compose.yml                      # Standalone Docker Compose setup
├── .dockerignore                           # Docker ignore rules
├── .gitignore                              # Git ignore rules
├── README.md                               # Project documentation
└── src/
    ├── components/                         # Navbar, LeadForm, QualificationReport, LeadDashboard, StatsOverview
    ├── services/                           # REST API client (`api.ts`) & client fallback
    ├── types/                              # TypeScript interfaces (`lead.ts`)
    ├── App.tsx                             # Main UI state controller
    └── index.css                           # Glassmorphism tokens & Tailwind styling
```

---

## 🚀 How to Run Frontend

### Option 1: Development Server (Node.js)
```bash
# Install dependencies
npm install

# Start Vite HMR dev server
npm run dev
```
Open **http://localhost:5173** in your browser.

---

### Option 2: Docker Compose (Nginx Web Server)
```bash
docker compose up --build
```
Open **http://localhost:3000** in your browser.

---

## 🌐 Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1/leads` | Target REST API backend endpoint |
