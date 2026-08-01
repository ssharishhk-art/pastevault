# 🚀 PasteVault - Production Full-Stack PasteBin Platform

> **Round 2 – Full Stack & DevOps Challenge Solution**

PasteVault is a production-grade code and text snippet sharing web application built for high-performance developer workflows, featuring a modern dark theme interface, real-time code editor, guest accounts, password-protected pastes, auto-expiration background jobs, WebGL 3D visual effects, and Docker multi-service orchestration.

---

## 🌐 Live Production Links

| Resource | Live Link |
| :--- | :--- |
| 💻 **Frontend Web Application** | [https://pastevault-2yrq.vercel.app](https://pastevault-2yrq.vercel.app) |
| ⚡ **Backend REST API Server** | [https://pastevault-q8ux.vercel.app](https://pastevault-q8ux.vercel.app) |
| 📖 **Interactive Swagger API Docs** | [https://pastevault-q8ux.vercel.app/api/docs](https://pastevault-q8ux.vercel.app/api/docs) |
| 📦 **GitHub Repository** | [https://github.com/ssharishhk-art/pastevault](https://github.com/ssharishhk-art/pastevault) |

---

## 📋 PDF Requirement Checklist Compliance

| Requirement | Implementation Status | Location |
| :--- | :--- | :--- |
| **1. Persistent Paste Storage** | ✅ Fully Implemented | PostgreSQL / SQLite Database via Prisma ORM |
| **2. CRUD Operations (Create, Retrieve, List, Delete)** | ✅ Fully Implemented | REST API endpoints & Web/CLI Clients |
| **3. Documented API** | ✅ Fully Implemented | Swagger UI interactive docs at `/api/docs` & `docs/openapi.yaml` |
| **4. Included Client(s)** | ✅ Dual Clients Included | 1. **Web Client** (React 18 + Vite + WebGL)<br>2. **CLI Client** (`npm run cli` / `pastevault`) |
| **5. Containerized using Docker** | ✅ Fully Implemented | `docker-compose.yml` (Nginx + Express Node + DB) |
| **6. README Setup Instructions** | ✅ Fully Implemented | Complete guide provided below |

---

## 🏗️ System Architecture & Data Flow

```
+-------------------------------------------------------------------+
|                        Client Browser                             |
|     (React 18 + Vite + Monaco Editor + Tailwind + Framer Motion)  |
+---------------------------------+---------------------------------+
                                  |
                           HTTP / REST API
                                  |
                                  v
+-------------------------------------------------------------------+
|                      Nginx Reverse Proxy                          |
|                    (Container: frontend:80)                       |
+---------------------------------+---------------------------------+
                                  |
                           Proxy Pass /api
                                  |
                                  v
+-------------------------------------------------------------------+
|                       Express Node API                            |
|     (TypeScript + Zod + Rate Limit + Pino + Cron Cleaner)        |
+---------------------------------+---------------------------------+
                                  |
                              Prisma ORM
                                  |
                                  v
+-------------------------------------------------------------------+
|                      PostgreSQL / SQLite                          |
|                      (Container: 5432)                            |
+-------------------------------------------------------------------+
```

### 🔐 Security & Data Design Principles:
1. **Anonymous Ownership**: Clients receive a unique `ownerToken` stored in `localStorage`, permitting paste management/deletion without mandatory sign-in.
2. **Bcrypt Protection**: Private pastes store salted `bcrypt` password hashes.
3. **Burn-After-Read**: Pastes marked as `burnAfterRead` are destroyed upon first retrieval.
4. **Auto-Expiration**: Background cron cleaner (`node-cron`) automatically purges expired pastes every 5 minutes.

---

## 🌟 Key Features

- 🔮 **3D Fluid Glass Splash Screen**: React Bits `<FluidGlass />` lens distortion around 3D `DEVS` typography with custom start flow.
- 🎨 **Translucent Glassmorphism UI**: High-contrast, dark aesthetic with frosted glass panels allowing wallpaper visibility.
- 💻 **Monaco Code Editor**: Real-time syntax highlighting for 30+ programming languages with smooth cursor scrolling.
- 👤 **Anonymous Guest Accounts**: Automatic session guest badge generation (`Guest_<ID>`).
- 📲 **Social Share Modal**: Direct 1-click sharing to **WhatsApp** and **Instagram**.
- 💻 **Terminal CLI Client**: Dedicated CLI tool (`npm run cli`) to create, fetch, and list pastes directly from your terminal.
- 🔐 **Password Protection**: Bcrypt-hashed password protection for private snippets.
- 🔥 **Delete After First View**: Automatic snippet destruction upon initial viewing.
- ⏱️ **Auto-Expiring Background Cleanup**: Automated background cron job purging expired pastes.
- ⚡ **Raw Pipe Support**: Dedicated `/api/pastes/:slug/raw` endpoint for seamless `curl` & terminal piping.
- 🌐 **Offline Connection Drop Page**: Real-time error 404 network detection screen.

---

## 🐳 Quick Start (Docker - Recommended)

To run the complete production multi-container environment (Nginx + Node API + PostgreSQL DB):

```bash
# Clone the repository
git clone https://github.com/ssharishhk-art/pastevault.git
cd pastevault

# Build & launch containers
docker-compose up --build
```

### 📍 Access Local Endpoints:
- **Web App Client**: [http://localhost](http://localhost)
- **Backend REST API**: [http://localhost:4000/api](http://localhost:4000/api)
- **Interactive Swagger API Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **API Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 💻 Terminal CLI Client Usage

PasteVault includes a built-in command-line interface client (`backend/src/cli.ts`):

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
npx prisma db push
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

---

## 📂 Project Structure

```
/pastevault
  ├── backend/           # Express + TypeScript + Prisma API & CLI Client
  │   ├── src/cli.ts     # Terminal CLI Client implementation
  │   └── src/index.ts   # REST API server & Swagger UI docs
  ├── frontend/          # React 18 + Vite + Tailwind + R3F WebGL Components
  ├── docs/              # OpenAPI specification & Architecture documentation
  ├── docker-compose.yml # Docker multi-container orchestrator
  └── render.yaml        # Render cloud deployment blueprint
```

---

### 📄 License
MIT License

