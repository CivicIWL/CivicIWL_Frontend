# CivicNavigator – Frontend

The **CivicNavigator** frontend is a **React + TypeScript + Vite** application providing a responsive, accessible interface for residents and staff to interact with municipal services.
It allows residents to chat with an AI-powered assistant, submit incident reports, and track their progress — while giving staff tools to triage incidents and manage the municipal knowledge base.

This repository contains only the **frontend web application**. For the backend API and AI services, see the [CivicNavigator Backend](https://github.com/CivicIWL/CivicIWL_Backend).

---

## 📦 Tech Stack

- **React 18** + **TypeScript** — modular, type-safe components
- **Vite** — fast builds and hot module reloads
- **TailwindCSS** — responsive, utility-first styling
- **shadcn/ui** — accessible UI components
- **Recharts** — data visualization for staff dashboards
- **react-hook-form** — form state management and validation
- **SWR** — client-side caching and revalidation
- **WebSocket** — real-time updates for incident status

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x (or yarn/pnpm)
- Access to the CivicNavigator Backend API
- Seeded Knowledge Base (80–200 documents; see backend repo)
- Modern browser (Chrome/Firefox/Edge)

---

### Installation

```bash
git clone https://github.com/CivicIWL/CivicIWL_Frontend.git
cd CivicIWL_Frontend
npm install
```

---

### Environment Variables

Copy `.env.example` → `.env.local` and configure:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_AI_HEALTHCHECK_URL=http://localhost:8000/ai/health
```

> **Note:** `.env.local` should not be committed.

---

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

### Production Build & Preview

```bash
npm run build
npm run preview
```

Build output is in `dist/`.

---

## 🖥 Features

### For Residents

- **AI Chatbot** — conversational Q\&A with citations and clarifications
- **Incident Reporting** — submit detailed reports with optional images
- **Status Tracking** — check progress with reference ID
- **Live Notifications** — updates via WebSocket

### For Staff

- **Incident Triage** — filter, review, and update cases
- **Knowledge Base Management** — add/update/reindex KB articles
- **Audit Logs** — track changes for accountability

---

## 🧪 Testing

- **Unit Tests** — for components and hooks
- **Integration Tests** — API/WebSocket interactions
- **E2E Tests** — resident/staff workflows
- **Accessibility Tests** — ARIA/contrast compliance
- **Performance Tests** — latency for chat & incident actions

Run:

```bash
npm run test
npm run test:e2e
npm run test:a11y
```

---

## 📊 Observability

- **Logs** — structured console output
- **Metrics** — request/latency counters (optional Prometheus)
- **Health Checks** — ping AI readiness endpoint
- **Troubleshooting** — trace requests via IDs in logs

---

## 🤝 Contributing

We welcome contributions:

1. Fork the repo & branch:

   ```bash
   git checkout -b feature/your-feature
   ```

2. Follow ESLint/Prettier formatting
3. Write tests for new features
4. Open a PR with description & test steps
5. Address code review feedback

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📜 Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview build
npm run lint      # Lint with ESLint
npm run format    # Format with Prettier
npm run test      # Unit & integration tests
npm run test:e2e  # End-to-end tests
npm run test:a11y # Accessibility tests
```

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---
