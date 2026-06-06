export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "🗳️ NEVTIK Voting API",
    description: `
API untuk sistem pemungutan suara (voting) organisasi NEVTIK.

## Fitur Utama
- **Admin Authentication** — Login menggunakan kredensial dari environment variables, mendapatkan JWT token.
- **Token Management** — Admin dapat membuat, melihat, dan menghapus token voting.
- **Anonymous Voting** — User dapat memilih kandidat menggunakan token sekali pakai (one-time-use).
- **Race Condition Prevention** — Menggunakan database transaction dengan Row Level Locking (\`SELECT ... FOR UPDATE\`).

## Autentikasi
Endpoint admin dilindungi dengan **JWT Bearer Token**. Untuk mendapatkan token:
1. Panggil \`POST /api/admin/login\` dengan username dan password.
2. Gunakan token yang didapat di header \`Authorization: Bearer <token>\`.

## Rate Limiting
- **Login**: Maksimal 10 request per 15 menit per IP.
- **Vote**: Maksimal 30 request per 1 menit per IP.
    `,
    version: "1.0.0",
    contact: {
      name: "NEVTIK Team",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "Admin Auth",
      description: "Autentikasi admin menggunakan kredensial dari .env",
    },
    {
      name: "Token Management",
      description: "Kelola token voting (generate, list, delete) — Membutuhkan JWT",
    },
    {
      name: "Candidates",
      description: "Endpoint publik untuk melihat daftar kandidat",
    },
    {
      name: "Voting",
      description: "Submit vote menggunakan token sekali pakai",
    },
    {
      name: "Health",
      description: "Health check endpoint",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan JWT token yang didapat dari endpoint login",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: { nullable: true },
        },
      },
      Candidate: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Ahmad Fadillah" },
          vision: { type: "string", example: "Mewujudkan organisasi yang inovatif..." },
          mission: { type: "string", example: "1. Meningkatkan kompetensi anggota..." },
          photoUrl: { type: "string", nullable: true, example: null },
          voteCount: { type: "integer", example: 5 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      VotingToken: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          token: { type: "string", example: "7582D862AF79" },
          isUsed: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          usedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string", example: "admin" },
          password: { type: "string", example: "admin123" },
        },
      },
      GenerateTokensRequest: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: {
            type: "integer",
            minimum: 1,
            maximum: 500,
            example: 10,
            description: "Jumlah token yang ingin dibuat (1-500)",
          },
        },
      },
      VoteRequest: {
        type: "object",
        required: ["token", "candidate_id"],
        properties: {
          token: {
            type: "string",
            example: "7582D862AF79",
            description: "Token voting yang diberikan admin",
          },
          candidate_id: {
            type: "integer",
            example: 1,
            description: "ID kandidat yang dipilih",
          },
        },
      },
    },
  },
  paths: {
    "/api/admin/login": {
      post: {
        tags: ["Admin Auth"],
        summary: "Login Admin",
        description:
          "Validasi kredensial admin terhadap environment variables. Jika cocok, mengembalikan JWT Bearer Token yang berlaku selama 24 jam.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login berhasil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Login berhasil." },
                    data: {
                      type: "object",
                      properties: {
                        token: {
                          type: "string",
                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validasi gagal (username/password kosong)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Username wajib diisi.",
                  data: null,
                },
              },
            },
          },
          "401": {
            description: "Kredensial salah",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Username atau password salah.",
                  data: null,
                },
              },
            },
          },
          "429": {
            description: "Rate limit terlampaui (maks 10 request per 15 menit)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
                  data: null,
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/tokens/generate": {
      post: {
        tags: ["Token Management"],
        summary: "Generate Token Voting",
        description:
          "Membuat token voting baru berupa random string unik 12 karakter. Setiap token hanya bisa digunakan satu kali untuk voting.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GenerateTokensRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Token berhasil dibuat",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "string",
                      example: "Berhasil membuat 10 token voting.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        tokens: {
                          type: "array",
                          items: { $ref: "#/components/schemas/VotingToken" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Jumlah token tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Jumlah token harus antara 1 dan 500.",
                  data: null,
                },
              },
            },
          },
          "401": {
            description: "JWT token tidak valid atau tidak disertakan",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Token tidak ditemukan. Harap login terlebih dahulu.",
                  data: null,
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/tokens": {
      get: {
        tags: ["Token Management"],
        summary: "List Token Belum Terpakai",
        description:
          "Mengembalikan daftar semua token voting yang belum digunakan (is_used = false), diurutkan dari yang terbaru.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Daftar token berhasil diambil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "string",
                      example: "Ditemukan 10 token yang belum digunakan.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        tokens: {
                          type: "array",
                          items: { $ref: "#/components/schemas/VotingToken" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/tokens/{id}": {
      delete: {
        tags: ["Token Management"],
        summary: "Hapus Token",
        description: "Menghapus token voting berdasarkan ID. Digunakan untuk koreksi administratif.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID token yang akan dihapus",
            schema: { type: "integer", example: 1 },
          },
        ],
        responses: {
          "200": {
            description: "Token berhasil dihapus",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: true,
                  message: "Token berhasil dihapus.",
                  data: null,
                },
              },
            },
          },
          "400": {
            description: "ID tidak valid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "ID token tidak valid.",
                  data: null,
                },
              },
            },
          },
          "404": {
            description: "Token tidak ditemukan",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Token tidak ditemukan.",
                  data: null,
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
              },
            },
          },
        },
      },
    },
    "/api/candidates": {
      get: {
        tags: ["Candidates"],
        summary: "Daftar Semua Kandidat",
        description:
          "Endpoint publik (tanpa autentikasi). Mengembalikan daftar semua kandidat beserta nama, visi, misi, dan jumlah vote yang sudah diterima.",
        responses: {
          "200": {
            description: "Daftar kandidat berhasil diambil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "string",
                      example: "Daftar kandidat berhasil diambil.",
                    },
                    data: {
                      type: "object",
                      properties: {
                        candidates: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Candidate" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/vote": {
      post: {
        tags: ["Voting"],
        summary: "Submit Vote",
        description: `
Melakukan voting untuk kandidat menggunakan token sekali pakai.

**Alur proses:**
1. Validasi token ada di database → \`404\` jika tidak ditemukan
2. Cek apakah token sudah digunakan → \`403\` jika sudah terpakai
3. Validasi kandidat ada → \`404\` jika tidak ditemukan
4. Jalankan database transaction dengan Row Level Locking:
   - \`SELECT ... FOR UPDATE\` pada baris token (mencegah race condition)
   - Update \`is_used = true\` pada token
   - Increment \`vote_count\` pada kandidat
5. Commit & return success

**Keamanan:** Menggunakan Row Level Locking untuk mencegah double voting pada skenario concurrent request.
        `,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VoteRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Vote berhasil dicatat",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: true,
                  message: "Vote berhasil dicatat. Terima kasih telah berpartisipasi!",
                  data: null,
                },
              },
            },
          },
          "400": {
            description: "Validasi gagal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Token voting wajib diisi.",
                  data: null,
                },
              },
            },
          },
          "403": {
            description: "Token sudah digunakan",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Token sudah digunakan. Setiap token hanya bisa digunakan satu kali.",
                  data: null,
                },
              },
            },
          },
          "404": {
            description: "Token atau kandidat tidak ditemukan",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Token tidak ditemukan.",
                  data: null,
                },
              },
            },
          },
          "429": {
            description: "Rate limit terlampaui",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: false,
                  message: "Terlalu banyak percobaan voting. Coba lagi dalam 1 menit.",
                  data: null,
                },
              },
            },
          },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health Check",
        description: "Cek apakah API server berjalan dengan baik.",
        responses: {
          "200": {
            description: "Server berjalan normal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiResponse" },
                example: {
                  success: true,
                  message: "API is running",
                  data: null,
                },
              },
            },
          },
        },
      },
    },
  },
};
