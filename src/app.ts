import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { adminRouter } from "./presentation/routes/admin.routes.js";
import { candidateRouter } from "./presentation/routes/candidate.routes.js";
import { voteRouter } from "./presentation/routes/vote.routes.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

// ============================================
// Global Middleware
// ============================================
app.use(cors());
app.use(express.json());

// ============================================
// Swagger API Documentation
// ============================================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "NEVTIK Voting API - Documentation",
}));

// Serve raw OpenAPI JSON spec
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

// ============================================
// API Routes
// ============================================
app.use("/api/admin", adminRouter);
app.use("/api/candidates", candidateRouter);
app.use("/api/vote", voteRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is running", data: null });
});

// ============================================
// Centralized Error Handler (must be last)
// ============================================
app.use(errorHandler);

export default app;
