# Construction & Infrastructure Company Portfolio Template

A modern, high-performance, and lightweight **Decoupled Microservice Portfolio Template** for construction, civil engineering, and infrastructure enterprises. Built with **Server-Side Rendered (SSR) Node.js + Express (EJS)**, **Vanilla JS**, and **PostgreSQL 15**, orchestrated cleanly with **Docker Compose**.

---

## 🏛️ Architecture & Services

The system strictly follows a **Decoupled Service Architecture** where only the middle API service directly communicates with PostgreSQL. The public website and the admin dashboard are completely isolated, ensuring that administrative tasks or updates never risk public site availability.

```
                      +-----------------------------+
                      |   Client Web Browsers       |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                                             |
              v (HTTP Port 8085)                            v (HTTP Port 8095)
+-----------------------------+               +-----------------------------+
|    Public Web Service       |               |    Admin Portal Service     |
|   (SSR EJS + Vanilla JS)    |               |   (SSR EJS + Vanilla JS)    |
|   Container: cp-web         |               |   Container: cp-admin       |
+--------------+--------------+               +--------------+--------------+
               |                                             |
               | (HTTP REST calls)                           | (HTTP REST calls)
               +----------------------+----------------------+
                                      |
                                      v (HTTP Port 4001)
                      +-----------------------------+
                      |      API Middle Service     |
                      |   (Node.js / Express REST)  |
                      |   Container: cp-api         |
                      +--------------+--------------+
                                     |
                                     | (Internal SQL on backend-net)
                                     v
                      +-----------------------------+
                      |     PostgreSQL Database     |
                      |    (PostgreSQL 15 Alpine)   |
                      |    Container: cp-db         |
                      +-----------------------------+
```

| Container | Service Role | Default Port | Internal Port | Healthcheck |
| :--- | :--- | :--- | :--- | :--- |
| **`cp-db`** | PostgreSQL 15 Database (Seed & Schemas) | `5434` | `5432` | `pg_isready` |
| **`cp-api`** | REST API Service (Sole DB connection) | `4001` | `4000` | `GET /health` |
| **`cp-web`** | Public Website Frontend (SSR EJS) | `8085` | `3000` | `GET /health` |
| **`cp-admin`** | Isolated Admin Panel (SSR EJS) | `8095` | `3000` | `GET /health` |

---

## 🚀 Quick Start

### 1. Prerequisites
- Docker Engine 20+ and Docker Compose v2.

### 2. Setup Environment
```bash
cp .env.example .env
```

### 3. Launch the Services
```bash
docker compose up -d --build
```
Containers start in strict sequence using health checks (`cp-db` ➔ `cp-api` ➔ `cp-web` & `cp-admin`).

### 4. Access the Applications
- **Public Website:** [http://localhost:8085](http://localhost:8085)
- **Admin Portal:** [http://localhost:8095/login](http://localhost:8095/login)
- **REST API:** [http://localhost:4001/api/projects](http://localhost:4001/api/projects)

---

## 🔐 Default Admin Credentials

- **URL:** `http://localhost:8095/login`
- **Email:** `admin@vertexconstruction.local`
- **Password:** `admin123`

---

## ✨ Features Included

### Public Website
- **Hero Banner:** Full-screen responsive video background (`/Hero.mp4`) with poster fallback (`/Hero.jpg`), CTA buttons, and bouncing scroll indicator.
- **Theme Manager:** Dark & Light mode toggle with `localStorage` persistence, seamless CSS variable transitions, and automatic logo inversion.
- **Header Scroll Blur:** Dynamic sticky navigation header with backdrop blur and active route tracking.
- **Services Explorer:** Interactive category tabs switching descriptions, bullet highlights, and visual assets without full reload.
- **Project Showcase:** Live filterable grid by category (Commercial, Residential, Industrial, Prestigious Projects).
- **Single Project Detail:** Rich narrative text, dynamic project specifications cards, and multi-image gallery with fullscreen keyboard-navigated Lightbox modal.
- **Awards & Testimonials:** Smooth interactive testimonial slider with previous/next navigation and indicator dots.
- **Direct WhatsApp Inquiry:** Contact form with automatic formatting that directs client inquiries straight to WhatsApp.
- **Responsive Mobile Drawer:** Smooth slide-out mobile menu for smartphones and tablets.

### Admin Dashboard
- **Password Protection:** Secure Bcrypt hashing and `HttpOnly` JWT session authentication.
- **One-Click Toggles:** Instantly toggle `is_active` and `is_featured` directly from the table.
- **Modal Project Builder:**
  - Automated URL slug generator.
  - Category, year, location, client, and narrative overview.
  - Main featured image uploader with live thumbnail preview.
  - 10-slot multi-image gallery manager with dynamic slot addition and removal.
  - Custom specifications builder with icon selector.
- **Safe Deletion:** Cascading database deletion with automated image cleanup.

---

## 📦 Directory Structure

```
Company_Portfolio/
├── admin/                 # Standalone Admin Service (EJS + Vanilla JS)
│   ├── public/            # Admin static assets (CSS, JS, Lucide)
│   ├── src/               # Express routes, controllers, and EJS views
│   └── Dockerfile
├── api-service/           # Decoupled REST API Service (Node.js + pg)
│   ├── src/               # PostgreSQL pool, routes, auth middleware
│   └── Dockerfile
├── database/
│   └── init/
│       └── 01-init.sql    # Schema, foreign keys, cascades & generic seed data
├── shared-uploads/        # Shared volume mounted for project uploads
│   └── projects/          # Sample generic project images
├── web/                   # Public Web Service (SSR EJS + Vanilla JS)
│   ├── public/            # Public assets (Hero.mp4, logo.png, CSS, icons)
│   ├── src/               # Web Express server, routes, views (partials & pages)
│   └── Dockerfile
├── docker-compose.yml     # Complete microservices orchestration
├── .env.example           # Config template
└── .gitignore
```

---

## 🎨 Customizing for a New Brand

1. **Brand Name & Info:** Search and replace "Vertex Construction Group" with your target company name in `web/src/views/partials/` and `web/src/routes/index.js`.
2. **Logo:** Replace `web/public/logo.png` and `admin/public/logo.png` with your transparent PNG logo (1024x1024 recommended).
3. **Contact & WhatsApp:** Update the phone number and address in `web/src/views/contact.ejs`, `footer.ejs`, and `web/public/js/main.js`.
4. **Hero Video/Poster:** Place custom `Hero.mp4` and `Hero.jpg` in `web/public/`.
5. **Database Seed Data:** Edit `database/init/01-init.sql` to preset custom projects and user credentials.
