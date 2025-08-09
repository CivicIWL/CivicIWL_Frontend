

# CivicNavigator – Frontend

This is the **React + TypeScript + Vite** frontend for the **CivicNavigator** platform.
It provides a responsive, modern interface for residents and staff to:

* Chat with the CivicNavigator AI.
* Report and track incidents.
* View dashboards and demographic insights.
* Manage the knowledge base.

---

## 📦 Tech Stack

* **React 18** with **TypeScript**
* **Vite** for fast dev/build
* **TailwindCSS** for styling
* **shadcn/ui** for components
* **Recharts** for charts
* **react-hook-form** for forms
* **SWR** for data fetching

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

* Node.js ≥ 18.x
* npm ≥ 9.x (or yarn/pnpm)
* Backend API for CivicNavigator running locally or hosted.

---

### 2️⃣ Installation

```bash
git clone https://github.com/<your-org>/civicnavigator-frontend.git
cd civicnavigator-frontend
npm install
```

---

### 3️⃣ Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_AI_HEALTHCHECK_URL=http://localhost:8000/ai/health
```

> Keep `.env.local` out of version control.

---

### 4️⃣ Development

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**

---

### 5️⃣ Production Build

```bash
npm run build
npm run preview
```

---

## 🖥 Features

* **Resident Chatbot** – Natural conversation with AI, citations included.
* **Incident Reporting** – Submit incident forms with optional attachments.
* **Status Tracking** – Look up incident progress by ID.
* **Staff Dashboard** – View, filter, and update incidents.
* **Demographic Insights** – View charts and reports.

---

## 📜 Linting & Code Quality

The project is configured with ESLint and TypeScript lint rules.

To expand the ESLint configuration for type-aware linting:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      // Or stricter:
      // ...tseslint.configs.strictTypeChecked,
      // Optionally stylistic:
      // ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

Optional plugins for React-specific rules:

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

Run lint:

```bash
npm run lint
```

---

## 📜 Scripts

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Run linter
npm run format      # Format with Prettier
```

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

---

If you want, I can also **add a “Contributing” section** so the README works for open-source and team onboarding. That way, both your **frontend and backend** READMEs match in style and structure.
Do you want me to add that?
