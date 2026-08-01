# System Architecture & Design Overview

## Architecture Overview
PasteVault is structured as a modern multi-service full-stack web application designed for high durability, responsiveness, and developer ergonomics.

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|   (React 18 + Vite + Monaco Editor + Tailwind + Motion)     |
+------------------------------+------------------------------+
                               |
                        HTTP / REST API
                               |
                               v
+-------------------------------------------------------------+
|                    Nginx Reverse Proxy                      |
|                  (Container: frontend:80)                   |
+------------------------------+------------------------------+
                               |
                        Proxy Pass /api
                               |
                               v
+-------------------------------------------------------------+
|                     Express Node API                        |
|   (TypeScript + Zod + Rate Limit + Pino + Cron Cleaner)     |
+------------------------------+------------------------------+
                               |
                           Prisma ORM
                               |
                               v
+-------------------------------------------------------------+
|                    PostgreSQL Database                      |
|                     (Container: 5432)                       |
+-------------------------------------------------------------+
```

## Security & Data Flow
1. **Anonymous Ownership**: Unauthenticated clients receive a unique `ownerToken` generated client-side and saved in `localStorage`. This token allows managing/deleting pastes created in that session without requiring account creation.
2. **Password Protection**: Pastes with password protection store a salted `bcrypt` hash in PostgreSQL. Access to paste content requires sending the password query parameter or authentication.
3. **Burn-After-Read**: Pastes flagged as `burnAfterRead` are purged from the database immediately upon the first completed read retrieval.
4. **Auto-Expiration**: A background cron service (`node-cron`) polls every 5 minutes and executes efficient batch purges (`DELETE FROM Paste WHERE expiresAt <= NOW()`).

## API Specification
OpenAPI 3.0 specs are available live at `/api/docs` served by Swagger UI.
