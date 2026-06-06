import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../generated/prisma/client.js";
import ws from "ws";
import { env } from "../../config/env.js";

// Required in Node.js environment (Neon needs WebSockets)
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
