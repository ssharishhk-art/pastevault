# 🏗️ System Architecture & Design Specification

## Overview
PasteVault is engineered as a modern multi-service full-stack web application designed for high durability, low latency, and developer ergonomics.

---

## 🏛️ High-Level System Architecture

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

---

## 🌐 Live Production Deployments

| Component | Target URL | Tech Stack |
| :--- | :--- | :--- |
| **Frontend Web App** | [https://pastevault-2yrq.vercel.app](https://pastevault-2yrq.vercel.app) | React 18, Vite, Three.js, Framer Motion |
| **Backend REST API** | [https://pastevault-q8ux.vercel.app](https://pastevault-q8ux.vercel.app) | Node.js, Express, TypeScript, Prisma ORM |
| **Swagger API Docs** | [https://pastevault-q8ux.vercel.app/api/docs](https://pastevault-q8ux.vercel.app/api/docs) | OpenAPI 3.0, Swagger UI |

---

## 🔐 Security & Data Flow Design

1. **Anonymous Ownership**: Unauthenticated clients receive a unique `ownerToken` generated client-side and saved in `localStorage`. This token permits managing/deleting pastes created in that session without mandatory sign-in.
2. **Password Protection**: Pastes with password protection store a salted `bcrypt` hash in PostgreSQL. Access to paste content requires sending the password query parameter or authentication header.
3. **Burn-After-Read**: Pastes flagged as `burnAfterRead` are purged from the database immediately upon the first completed read retrieval.
4. **Auto-Expiration**: A background cron service (`node-cron`) polls every 5 minutes and executes efficient batch purges (`DELETE FROM Paste WHERE expiresAt <= NOW()`).

---

## 💻 Included Clients
1. **Web Client**: Production single-page application built with React 18, Monaco code editor, and WebGL graphics (`frontend/`).
2. **Terminal CLI Client**: Native terminal command line interface tool (`backend/src/cli.ts`) for shell interaction (`npm run cli -- create|list|get`).

---

## 📚 API Specification
OpenAPI 3.0 specification file is located at [`docs/openapi.yaml`](file:///c:/Users/haris/Documents/PasteBin%20web/docs/openapi.yaml) and served interactively via Swagger UI at `/api/docs`.
