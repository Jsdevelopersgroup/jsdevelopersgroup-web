# JS Developers Group — Official Web & Admin Microservices

Official production website and administrative portal for **JS Developers Group** (Kanhangad, Kerala). Rebuilt with a modern **Decoupled Service Architecture** using **Server-Side Rendered (SSR) Node.js + Express (EJS)**, **Vanilla JS**, and **PostgreSQL 15**, managed via **Docker Compose**.

Forked from the [Company Portfolio Template](https://github.com/vijayvarghese/company-portfolio-template).

---

## 🏛️ Architecture & Services

The system strictly follows a decoupled microservice model:

```
                      +-----------------------------+
                      |   Client Web Browsers       |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                                             |
              v (Port 8080)                                 v (Port 8090)
+-----------------------------+               +-----------------------------+
|     Public Web Service      |               |     Admin Portal Service    |
|   (SSR EJS + Vanilla JS)    |               |    (SSR EJS + Vanilla JS)   |
|   Container: jsc-web        |               |    Container: jsc-admin     |
+--------------+--------------+               +--------------+--------------+
               |                                             |
               | (HTTP REST calls)                           | (HTTP REST calls)
               +----------------------+----------------------+
                                      |
                                      v (Port 4000)
                      +-----------------------------+
                      |      API Middle Service     |
                      |   (Node.js / Express REST)  |
                      |   Container: jsc-api        |
                      +--------------+--------------+
                                     |
                                     | (Internal SQL on backend-net)
                                     v
                      +-----------------------------+
                      |     PostgreSQL Database     |
                      |    (PostgreSQL 15 Alpine)   |
                      |    Container: jsc-db        |
                      +-----------------------------+
```

| Container | Service Role | Host Port | Internal Port | Healthcheck |
| :--- | :--- | :--- | :--- | :--- |
| **`jsc-db`** | PostgreSQL 15 Database (Seed & Schema) | `5433` | `5432` | `pg_isready` (healthy) |
| **`jsc-api`** | REST API Service (Sole DB Access) | `4000` | `4000` | `GET /health` (healthy) |
| **`jsc-web`** | Public Website Frontend (SSR EJS) | `8080` | `3000` | `GET /health` (healthy) |
| **`jsc-admin`** | Isolated Admin Panel (SSR EJS) | `8090` | `3000` | `GET /health` (healthy) |

---

## 🚀 Running the Services

```bash
docker compose up -d --build
```

---

## 🔐 Admin Panel Access

- **URL:** [http://localhost:8090/login](http://localhost:8090/login)
- **Email:** `JS@jsdevelopersgroup.com`
- **Password:** `admin123`
