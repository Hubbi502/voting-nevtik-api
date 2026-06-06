# 🗳️ NEVTIK Voting API

RESTful API untuk sistem pemungutan suara (voting) organisasi NEVTIK. Dibangun dengan prinsip **Clean Architecture**, mengutamakan keamanan, efisiensi, dan kemudahan maintenance.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-green?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-purple?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)](https://neon.tech/)

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur](#-arsitektur-clean-architecture)
- [Instalasi & Setup](#-instalasi--setup)
- [Environment Variables](#-environment-variables)
- [Menjalankan Server](#-menjalankan-server)
- [API Documentation (Swagger)](#-api-documentation-swagger)
- [API Endpoints](#-api-endpoints)
  - [Admin Auth](#1-admin-login)
  - [Token Management](#2-generate-token-voting)
  - [Candidates](#5-daftar-kandidat)
  - [Voting](#6-submit-vote)
- [Alur Sistem](#-alur-sistem)
- [Keamanan](#-keamanan)
- [Database Schema](#-database-schema)
- [Scripts](#-npm-scripts)
- [Struktur Folder](#-struktur-folder)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Admin Auth** | Login menggunakan kredensial dari environment variables, mendapatkan JWT token |
| 🎫 **Token Management** | Generate, lihat, dan hapus token voting unik |
| 🗳️ **Anonymous Voting** | Voting anonim menggunakan token sekali pakai (one-time-use) |
| 🔒 **Race Condition Prevention** | Database transaction dengan Row Level Locking (`SELECT ... FOR UPDATE`) |
| 🛡️ **Rate Limiting** | Perlindungan brute force pada login dan voting endpoint |
| ⚠️ **Centralized Error Handling** | Format response error yang konsisten di seluruh API |
| ✅ **Input Validation** | Validasi semua input menggunakan Zod schema |
| 📖 **Swagger Docs** | Dokumentasi API interaktif di `/api-docs` |

---

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| **TypeScript** | Bahasa pemrograman utama (type-safe) |
| **Express.js 5** | Web framework |
| **Prisma ORM 7** | Object-Relational Mapping & query builder |
| **PostgreSQL (Neon)** | Database relasional (serverless) |
| **JSON Web Token (JWT)** | Autentikasi admin |
| **Zod 4** | Schema validation |
| **Swagger UI** | Dokumentasi API interaktif |

---

## 🏗️ Arsitektur (Clean Architecture)

Project ini menerapkan **Clean Architecture** dengan pemisahan tanggung jawab yang jelas:

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│              (Controllers & Routes)                  │
│         Menangani HTTP Request/Response              │
├─────────────────────────────────────────────────────┤
│                   Use Cases Layer                    │
│           (Application Business Rules)               │
│         Logika bisnis aplikasi voting                │
├─────────────────────────────────────────────────────┤
│                   Domain Layer                       │
│           (Enterprise Business Rules)                │
│         Entity interfaces & Repository contracts     │
├─────────────────────────────────────────────────────┤
│               Infrastructure Layer                   │
│            (Frameworks & Drivers)                    │
│         Prisma ORM, Database connection              │
└─────────────────────────────────────────────────────┘
```

**Dependency Rule:** Lapisan luar bergantung pada lapisan dalam, **bukan sebaliknya**. Domain layer tidak mengetahui framework atau database yang digunakan.

---

## 🚀 Instalasi & Setup

### Prasyarat

- **Node.js** v18 atau lebih baru
- **npm** v9 atau lebih baru
- **PostgreSQL** database (atau akun [Neon](https://neon.tech/) untuk serverless PostgreSQL)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd voting_nevtik_api

# 2. Install dependencies
npm install

# 3. Salin file environment (atau buat manual)
cp .env.example .env
# Edit .env sesuai kebutuhan

# 4. Generate Prisma Client
npm run db:generate

# 5. Push schema ke database
npm run db:push

# 6. (Opsional) Seed data kandidat awal
npm run db:seed
```

---

## 🔑 Environment Variables

Buat file `.env` di root project dengan variabel berikut:

```env
# Database Connection String
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Admin Credentials (Digunakan untuk login admin)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# JWT Secret Key (Gunakan string yang kuat dan acak di production!)
JWT_SECRET=your-super-secret-key-here

# Server Port
PORT=3000
```

> ⚠️ **Penting:** Pada production, pastikan menggunakan `JWT_SECRET` yang kuat dan `ADMIN_PASSWORD` yang aman. Jangan gunakan nilai default!

---

## ▶️ Menjalankan Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:3000` (atau port sesuai `.env`).

Output startup:
```
🗳️  Voting API server running on http://localhost:3000
📖 API Docs: http://localhost:3000/api-docs
📋 Endpoints:
   POST   /api/admin/login
   POST   /api/admin/tokens/generate
   GET    /api/admin/tokens
   DELETE /api/admin/tokens/:id
   GET    /api/candidates
   POST   /api/vote
   GET    /api/health
```

---

## 📖 API Documentation (Swagger)

Setelah server berjalan, akses dokumentasi API interaktif di:

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI JSON**: [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

Swagger UI memungkinkan Anda:
- Melihat detail setiap endpoint
- Mencoba request langsung dari browser
- Melihat contoh request & response
- Mengautentikasi menggunakan JWT (klik tombol "Authorize" 🔓)

---

## 📡 API Endpoints

### Format Response

Semua response API mengikuti format konsisten:

```json
{
  "success": true | false,
  "message": "Deskripsi hasil",
  "data": { ... } | null
}
```

### Ringkasan Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| `POST` | `/api/admin/login` | ❌ | Login admin, mendapatkan JWT |
| `POST` | `/api/admin/tokens/generate` | 🔐 | Generate token voting baru |
| `GET` | `/api/admin/tokens` | 🔐 | List token yang belum terpakai |
| `DELETE` | `/api/admin/tokens/:id` | 🔐 | Hapus token tertentu |
| `GET` | `/api/candidates` | ❌ | Daftar semua kandidat |
| `POST` | `/api/vote` | ❌ | Submit vote dengan token |
| `GET` | `/api/health` | ❌ | Health check |

> 🔐 = Membutuhkan header `Authorization: Bearer <JWT_TOKEN>`

---

### 1. Admin Login

Login menggunakan kredensial admin dari environment variables.

```
POST /api/admin/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Gagal (401):**
```json
{
  "success": false,
  "message": "Username atau password salah.",
  "data": null
}
```

**Rate Limit:** Maksimal 10 request per 15 menit per IP.

---

### 2. Generate Token Voting

Membuat token voting acak yang unik. Setiap token berupa string 12 karakter alfanumerik uppercase.

```
POST /api/admin/tokens/generate
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "amount": 50
}
```

**Response Sukses (201):**
```json
{
  "success": true,
  "message": "Berhasil membuat 50 token voting.",
  "data": {
    "tokens": [
      {
        "id": 1,
        "token": "7582D862AF79",
        "isUsed": false,
        "createdAt": "2026-06-06T09:40:43.773Z",
        "usedAt": null
      }
    ]
  }
}
```

> **Batas:** Minimal 1, maksimal 500 token per request.

---

### 3. List Token Belum Terpakai

Mengembalikan semua token yang belum digunakan (status `isUsed = false`).

```
GET /api/admin/tokens
Authorization: Bearer <JWT_TOKEN>
```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Ditemukan 48 token yang belum digunakan.",
  "data": {
    "tokens": [
      {
        "id": 1,
        "token": "7582D862AF79",
        "isUsed": false,
        "createdAt": "2026-06-06T09:40:43.773Z",
        "usedAt": null
      }
    ]
  }
}
```

---

### 4. Hapus Token

Menghapus token berdasarkan ID. Digunakan untuk koreksi administratif.

```
DELETE /api/admin/tokens/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Token berhasil dihapus.",
  "data": null
}
```

**Response Gagal (404):**
```json
{
  "success": false,
  "message": "Token tidak ditemukan.",
  "data": null
}
```

---

### 5. Daftar Kandidat

Endpoint publik (tanpa autentikasi). Mengembalikan semua kandidat beserta informasi dan jumlah vote.

```
GET /api/candidates
```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Daftar kandidat berhasil diambil.",
  "data": {
    "candidates": [
      {
        "id": 1,
        "name": "Ahmad Fadillah",
        "vision": "Mewujudkan organisasi NEVTIK yang inovatif...",
        "mission": "1. Meningkatkan kompetensi anggota...",
        "photoUrl": null,
        "voteCount": 5,
        "createdAt": "2026-06-06T09:41:06.004Z",
        "updatedAt": "2026-06-06T09:41:18.525Z"
      }
    ]
  }
}
```

---

### 6. Submit Vote

Melakukan voting menggunakan token sekali pakai. Token hanya bisa digunakan **satu kali**.

```
POST /api/vote
```

**Request Body:**
```json
{
  "token": "7582D862AF79",
  "candidate_id": 1
}
```

**Response Sukses (200):**
```json
{
  "success": true,
  "message": "Vote berhasil dicatat. Terima kasih telah berpartisipasi!",
  "data": null
}
```

**Kemungkinan Error:**

| Status | Kondisi | Pesan |
|--------|---------|-------|
| `400` | Input tidak valid | `"Token voting wajib diisi."` |
| `403` | Token sudah dipakai | `"Token sudah digunakan. Setiap token hanya bisa digunakan satu kali."` |
| `404` | Token tidak ada | `"Token tidak ditemukan."` |
| `404` | Kandidat tidak ada | `"Kandidat tidak ditemukan."` |
| `429` | Rate limit | `"Terlalu banyak percobaan voting. Coba lagi dalam 1 menit."` |

**Rate Limit:** Maksimal 30 request per 1 menit per IP.

---

### 7. Health Check

```
GET /api/health
```

**Response (200):**
```json
{
  "success": true,
  "message": "API is running",
  "data": null
}
```

---

## 🔄 Alur Sistem

### Alur Admin

```
Admin                           Server                          Database
  │                               │                               │
  │──── POST /admin/login ────────▶│                               │
  │     {username, password}       │── Compare with .env ──────────│
  │◀──── JWT Token ────────────────│                               │
  │                               │                               │
  │──── POST /admin/tokens/gen ───▶│                               │
  │     {amount: 50}              │── Create tokens ──────────────▶│
  │     Authorization: Bearer JWT  │◀── Return created tokens ─────│
  │◀──── 50 unique tokens ────────│                               │
  │                               │                               │
  │──── GET /admin/tokens ────────▶│                               │
  │     Authorization: Bearer JWT  │── Query unused tokens ────────▶│
  │◀──── List unused tokens ──────│◀── Return results ─────────────│
```

### Alur Voting (Krusial)

```
User                            Server                          Database
  │                               │                               │
  │──── GET /candidates ──────────▶│                               │
  │◀──── List kandidat ───────────│── Query all candidates ────────▶│
  │                               │◀── Return results ─────────────│
  │                               │                               │
  │──── POST /vote ───────────────▶│                               │
  │     {token, candidate_id}      │                               │
  │                               │── 1. Find token ──────────────▶│
  │                               │◀── Token found ────────────────│
  │                               │── 2. Check is_used ────────────│
  │                               │── 3. Find candidate ──────────▶│
  │                               │◀── Candidate found ────────────│
  │                               │                               │
  │                               │── BEGIN TRANSACTION ───────────▶│
  │                               │── SELECT ... FOR UPDATE ──────▶│ ← Row Lock
  │                               │── UPDATE is_used = true ──────▶│
  │                               │── INCREMENT vote_count ────────▶│
  │                               │── COMMIT ──────────────────────▶│
  │                               │                               │
  │◀──── Vote berhasil ───────────│                               │
```

---

## 🔒 Keamanan

### 1. Pencegahan Race Condition

Sistem menggunakan **Row Level Locking** (`SELECT ... FOR UPDATE`) dalam database transaction untuk mencegah double voting:

```sql
-- Di dalam transaction:
SELECT * FROM "voting_tokens" WHERE "id" = $1 FOR UPDATE;
-- Baris token dikunci secara eksklusif
-- Request lain harus menunggu hingga transaction selesai
UPDATE "voting_tokens" SET "is_used" = true WHERE "id" = $1;
UPDATE "candidates" SET "vote_count" = "vote_count" + 1 WHERE "id" = $2;
COMMIT;
```

**Mengapa ini efisien:**
- Hanya mengunci **satu baris** token, bukan seluruh tabel
- Lock ditahan **minimal** (hanya selama durasi transaction)
- PostgreSQL MVCC tetap memperbolehkan operasi baca pada baris lain secara bersamaan
- Jika 2 request datang bersamaan dengan token yang sama, yang kedua menunggu hingga yang pertama commit, lalu melihat `is_used = true` dan ditolak

### 2. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/admin/login` | 10 request | 15 menit |
| `POST /api/vote` | 30 request | 1 menit |

Rate limiter menggunakan in-memory store per IP address dengan automatic cleanup.

### 3. JWT Authentication

- Token JWT berlaku selama **24 jam**
- Payload berisi `username` dan `role: "admin"`
- Diverifikasi menggunakan secret key dari environment variable
- Diperlukan untuk semua endpoint di `/api/admin/*` (kecuali login)

### 4. Input Validation

Semua input request body divalidasi menggunakan **Zod schema** sebelum masuk ke business logic. Invalid input langsung ditolak dengan pesan error yang jelas.

### 5. Centralized Error Handling

Semua error ditangani oleh satu middleware pusat, memastikan:
- Format response yang konsisten (`{success, message, data}`)
- Tidak ada stack trace yang leak ke client di production
- Error logging di server console untuk debugging

---

## 🗄️ Database Schema

### Tabel `candidates`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | `SERIAL PRIMARY KEY` | ID auto-increment |
| `name` | `VARCHAR` | Nama kandidat |
| `vision` | `TEXT` | Visi kandidat |
| `mission` | `TEXT` | Misi kandidat |
| `photo_url` | `VARCHAR` (nullable) | URL foto kandidat |
| `vote_count` | `INTEGER` (default: 0) | Jumlah vote yang diterima |
| `created_at` | `TIMESTAMP` | Waktu pembuatan |
| `updated_at` | `TIMESTAMP` | Waktu update terakhir |

### Tabel `voting_tokens`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | `SERIAL PRIMARY KEY` | ID auto-increment |
| `token` | `VARCHAR UNIQUE` | String token unik (12 karakter) |
| `is_used` | `BOOLEAN` (default: false) | Status penggunaan token |
| `created_at` | `TIMESTAMP` | Waktu pembuatan |
| `used_at` | `TIMESTAMP` (nullable) | Waktu token digunakan |

### Prisma Schema

```prisma
model Candidate {
  id        Int      @id @default(autoincrement())
  name      String
  vision    String   @db.Text
  mission   String   @db.Text
  photoUrl  String?  @map("photo_url")
  voteCount Int      @default(0) @map("vote_count")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("candidates")
}

model VotingToken {
  id        Int       @id @default(autoincrement())
  token     String    @unique
  isUsed    Boolean   @default(false) @map("is_used")
  createdAt DateTime  @default(now()) @map("created_at")
  usedAt    DateTime? @map("used_at")

  @@map("voting_tokens")
}
```

---

## 📜 NPM Scripts

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| `npm run dev` | `tsx watch src/server.ts` | Jalankan dev server (auto-reload) |
| `npm start` | `tsx src/server.ts` | Jalankan production server |
| `npm run db:migrate` | `prisma migrate dev` | Buat & jalankan migrasi database |
| `npm run db:generate` | `prisma generate` | Generate Prisma Client |
| `npm run db:push` | `prisma db push` | Sync schema ke database (tanpa migrasi) |
| `npm run db:seed` | `tsx src/seed.ts` | Seed database dengan data kandidat awal |

---

## 📂 Struktur Folder

```
voting_nevtik_api/
├── prisma/
│   └── schema.prisma              # Definisi schema database
├── src/
│   ├── config/
│   │   ├── env.ts                 # Validasi environment variables (Zod)
│   │   └── swagger.ts             # OpenAPI 3.0 specification
│   ├── domain/                    # 🟢 Enterprise Business Rules
│   │   ├── entities/
│   │   │   ├── candidate.entity.ts    # Interface tipe Candidate
│   │   │   └── token.entity.ts        # Interface tipe VotingToken
│   │   └── repositories/
│   │       ├── candidate.repository.ts    # Kontrak repository Candidate
│   │       └── token.repository.ts        # Kontrak repository Token
│   ├── usecases/                  # 🔵 Application Business Rules
│   │   ├── auth.usecase.ts        # Logika login (validasi .env + JWT)
│   │   ├── admin.usecase.ts       # Logika CRUD token voting
│   │   └── vote.usecase.ts        # Logika voting + validasi token
│   ├── infrastructure/            # 🟠 Frameworks & Drivers
│   │   ├── database/
│   │   │   └── prisma.ts          # Prisma Client (Neon adapter)
│   │   └── repositories/
│   │       ├── candidate.repository.impl.ts   # Implementasi Prisma
│   │       └── token.repository.impl.ts       # Implementasi + Transaction
│   ├── presentation/              # 🟣 Interface Adapters
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts         # Handle login request
│   │   │   ├── admin.controller.ts        # Handle token management
│   │   │   ├── candidate.controller.ts    # Handle candidate list
│   │   │   └── vote.controller.ts         # Handle vote submission
│   │   └── routes/
│   │       ├── admin.routes.ts        # Routes: /api/admin/*
│   │       ├── candidate.routes.ts    # Routes: /api/candidates
│   │       └── vote.routes.ts         # Routes: /api/vote
│   ├── middlewares/
│   │   ├── auth.middleware.ts             # JWT verification
│   │   ├── error-handler.middleware.ts    # Centralized error handler
│   │   ├── rate-limiter.middleware.ts     # In-memory rate limiter
│   │   └── validate.middleware.ts         # Zod validation middleware
│   ├── generated/prisma/          # Auto-generated Prisma Client
│   ├── app.ts                     # Express app setup & route wiring
│   ├── server.ts                  # HTTP server entry point
│   └── seed.ts                    # Database seeder
├── .env                           # Environment variables (jangan commit!)
├── .gitignore
├── package.json
├── tsconfig.json
└── prisma.config.ts               # Prisma CLI configuration
```

---

## 🧪 Contoh Penggunaan (cURL)

### Login Admin
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Generate 10 Token
```bash
curl -X POST http://localhost:3000/api/admin/tokens/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"amount": 10}'
```

### List Token Tersisa
```bash
curl -X GET http://localhost:3000/api/admin/tokens \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Hapus Token
```bash
curl -X DELETE http://localhost:3000/api/admin/tokens/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Lihat Kandidat
```bash
curl -X GET http://localhost:3000/api/candidates
```

### Submit Vote
```bash
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"token": "7582D862AF79", "candidate_id": 1}'
```

---

## 📝 Lisensi

Dibuat oleh **NEVTIK Team** © 2026
