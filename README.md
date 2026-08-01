# 🚀 PasteVault - Production Full-Stack PasteBin Platform

> **Round 2 – Full Stack & DevOps Challenge Solution**

PasteVault is a production-grade code and text snippet sharing platform built with high performance, developer ergonomics, security, and modern dark-mode aesthetic standards.

---

## 📋 PDF Requirement Checklist Compliance

| Requirement | Implementation Status | Location |
| :--- | :--- | :--- |
| **1. Persistent Paste Storage** | ✅ Fully Implemented | PostgreSQL / SQLite Database via Prisma ORM |
| **2. CRUD Operations (Create, Retrieve, List, Delete)** | ✅ Fully Implemented | REST API endpoints & Web/CLI Clients |
| **3. Documented API** | ✅ Fully Implemented | Swagger UI interactive docs at `/api/docs` & `docs/openapi.yaml` |
| **4. Included Client(s)** | ✅ Dual Clients Included | 1. **Web Client** (React 18 + Vite + WebGL)<br>2. **CLI Client** (`npm run cli` / `pastevault`) |
| **5. Containerized using Docker** | ✅ Fully Implemented | `docker-compose.yml` (Nginx + Express Node + DB) |
| **6. README Setup Instructions** | ✅ Fully Implemented | See detailed instructions below |

---

## 🌟 Key Features

- 🎨 **Futuristic UI & WebGL Visual Effects**: Built with React Bits dynamic canvas components (`RippleGrid` background, `FluidGlass` 3D Monaco container, `ElectricBorder` glow, and `GlitchText` typography).
- 💻 **Monaco Code Editor**: Real-time syntax highlighting for 30+ programming languages.
- 💻 **Terminal CLI Client**: Dedicated CLI tool (`npm run cli`) to create, fetch, and list pastes directly from your shell terminal.
- 🔐 **Password Protection**: Bcrypt-hashed password protection for private snippets.
- 🔥 **Delete After First View**: Automatic snippet destruction upon initial viewing.
- ⏱️ **Auto-Expiring Background Cleanup**: Automated background cron job (`node-cron`) purging expired pastes every 5 minutes.
- ⚡ **Raw Pipe Support**: Dedicated `/api/pastes/:slug/raw` endpoint for seamless `curl` & terminal piping.
- 📲 **Social Share Modal**: One-click sharing directly to WhatsApp and Instagram.
- 🌐 **Offline Network Detection**: Automatic Error 404 connection drop detection screen.

---

## 🐳 Quick Start (Docker - Recommended)

To run the complete production multi-container environment (Nginx + Node API + PostgreSQL DB):

```bash
# Clone the repository
git clone <your-repo-url>
cd pastebin-web

# Build & launch containers
docker-compose up --build
```

### 📍 Access Endpoints:
- **Web App Client**: [http://localhost](http://localhost)
- **Backend REST API**: [http://localhost:4000/api](http://localhost:4000/api)
- **Interactive Swagger API Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **API Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 💻 Terminal CLI Client Usage

PasteVault includes a built-in command-line interface client (`src/cli.ts`):

```bash
cd backend

# 1. Create a new paste from CLI
npm run cli -- create --title "CLI Demo" --content "console.log('Hello World');" --language "javascript"

# 2. List public pastes
npm run cli -- list

# 3. Retrieve paste content by slug
npm run cli -- get <paste-slug>
```

---

## 🛠️ Local Development Setup (Without Docker)

### 1. Backend Server Setup
```bash
cd backend
npm install
npm run dev
```
*Backend listens at `http://localhost:4000`*

### 2. Frontend Web App Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend listens at `http://localhost:5173`*

---

## 📚 Documented API Reference

Interactive OpenAPI 3.0 documentation is hosted via Swagger UI at `/api/docs`.

### Core API Endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/pastes` | Create a new code paste snippet |
| `GET` | `/api/pastes` | Fetch public explore feed pastes |
| `GET` | `/api/pastes/mine` | Fetch pastes owned by client session |
| `GET` | `/api/pastes/:slug` | Retrieve paste details (increments view once per device) |
| `GET` | `/api/pastes/:slug/raw` | Get raw code plain text response |
| `DELETE`| `/api/pastes/:slug` | Delete a paste |
| `GET` | `/health` | Server status health check |

---

## 🧪 Testing & DevOps CI/CD

Run backend & frontend unit test suites:
```bash
npm run test:backend
```

Automated GitHub Actions CI workflow runs unit tests and build checks on every commit (`.github/workflows/ci.yml`).

---

## 📂 Project Architecture

```
/pastebin-web
  ├── backend/           # Express + TypeScript + Prisma API & CLI Client
  │   ├── src/cli.ts     # Terminal CLI Client implementation
  │   └── src/index.ts   # REST API server & Swagger UI docs
  ├── frontend/          # React 18 + Vite + Tailwind + R3F WebGL Components
  ├── docs/              # OpenAPI specification & Architecture documentation
  ├── docker-compose.yml # Docker multi-container orchestrator
  └── .github/workflows/ # GitHub Actions CI workflow
```
