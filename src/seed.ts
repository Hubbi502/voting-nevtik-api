import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma/client.js";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.votingToken.deleteMany();
  await prisma.candidate.deleteMany();

  // Create candidates
  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        name: "Ahmad Fadillah",
        vision: "Mewujudkan organisasi NEVTIK yang inovatif, inklusif, dan berdaya saing tinggi di era digital.",
        mission: "1. Meningkatkan kompetensi anggota melalui pelatihan teknologi terkini.\n2. Membangun kolaborasi dengan komunitas IT lainnya.\n3. Mengembangkan proyek-proyek teknologi yang bermanfaat bagi masyarakat.",
        photoUrl: null,
      },
    }),
    prisma.candidate.create({
      data: {
        name: "Siti Nurhaliza",
        vision: "Menjadikan NEVTIK sebagai wadah pengembangan talenta digital yang unggul dan berkarakter.",
        mission: "1. Menyelenggarakan workshop dan seminar berkala.\n2. Membuka kesempatan magang di industri teknologi.\n3. Membangun platform pembelajaran online untuk anggota.",
        photoUrl: null,
      },
    }),
    prisma.candidate.create({
      data: {
        name: "Rizky Pratama",
        vision: "Membangun ekosistem teknologi yang solid dan memberdayakan seluruh anggota NEVTIK.",
        mission: "1. Menciptakan program mentoring senior-junior.\n2. Mengadakan hackathon dan kompetisi internal.\n3. Memperluas jaringan kerjasama dengan perusahaan teknologi.",
        photoUrl: null,
      },
    }),
  ]);

  console.log(`✅ Created ${candidates.length} candidates:`);
  candidates.forEach((c) => console.log(`   - ${c.name} (ID: ${c.id})`));

  await prisma.$disconnect();
  console.log("🌱 Seeding complete!");
}

seed().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
