import { env } from "./config/env.js";
import app from "./app.js";

const PORT = parseInt(env.PORT, 10) || 3000;

app.listen(PORT, () => {
  console.log(`🗳️  Voting API server running on http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST   /api/admin/login`);
  console.log(`   POST   /api/admin/tokens/generate`);
  console.log(`   GET    /api/admin/tokens`);
  console.log(`   DELETE /api/admin/tokens/:id`);
  console.log(`   GET    /api/candidates`);
  console.log(`   POST   /api/vote`);
  console.log(`   GET    /api/health`);
});
