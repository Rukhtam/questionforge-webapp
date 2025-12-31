import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const subjects = [
  {
    name: "Math",
    nameUrdu: "ریاضی",
    icon: "\u{1F4D0}", // Triangular ruler emoji
    topics: [
      { name: "Algebra", gradeLevel: "6-8" },
      { name: "Geometry", gradeLevel: "6-8" },
      { name: "Arithmetic", gradeLevel: "1-5" },
      { name: "Fractions", gradeLevel: "3-6" },
      { name: "Percentages", gradeLevel: "5-8" },
      { name: "Statistics", gradeLevel: "7-10" },
      { name: "Trigonometry", gradeLevel: "9-12" },
      { name: "Calculus", gradeLevel: "11-12" },
    ],
  },
  {
    name: "English",
    nameUrdu: "انگلش",
    icon: "\u{1F4DA}", // Books emoji
    topics: [
      { name: "Grammar", gradeLevel: "1-12" },
      { name: "Vocabulary", gradeLevel: "1-12" },
      { name: "Reading Comprehension", gradeLevel: "3-12" },
      { name: "Essay Writing", gradeLevel: "5-12" },
      { name: "Literature", gradeLevel: "6-12" },
      { name: "Poetry", gradeLevel: "5-12" },
      { name: "Creative Writing", gradeLevel: "4-12" },
    ],
  },
  {
    name: "Science",
    nameUrdu: "سائنس",
    icon: "\u{1F52C}", // Microscope emoji
    topics: [
      { name: "Physics", gradeLevel: "6-12" },
      { name: "Chemistry", gradeLevel: "6-12" },
      { name: "Biology", gradeLevel: "6-12" },
      { name: "General Science", gradeLevel: "1-5" },
      { name: "Environmental Science", gradeLevel: "3-8" },
      { name: "Human Body", gradeLevel: "4-8" },
      { name: "Plants and Animals", gradeLevel: "1-6" },
    ],
  },
  {
    name: "Urdu",
    nameUrdu: "اردو",
    icon: "\u{270D}\u{FE0F}", // Writing hand emoji
    topics: [
      { name: "Grammar (Qawaid)", gradeLevel: "1-12" },
      { name: "Poetry (Shairi)", gradeLevel: "3-12" },
      { name: "Prose (Nasr)", gradeLevel: "3-12" },
      { name: "Essay Writing (Mazmoon Nawisi)", gradeLevel: "5-12" },
      { name: "Letter Writing (Khat Nawisi)", gradeLevel: "4-10" },
      { name: "Comprehension (Fahm o Idrak)", gradeLevel: "3-12" },
    ],
  },
  {
    name: "Islamiyat",
    nameUrdu: "اسلامیات",
    icon: "\u{262A}\u{FE0F}", // Star and crescent emoji
    topics: [
      { name: "Quran", gradeLevel: "1-12" },
      { name: "Hadith", gradeLevel: "4-12" },
      { name: "Islamic History", gradeLevel: "5-12" },
      { name: "Fiqh (Islamic Jurisprudence)", gradeLevel: "6-12" },
      { name: "Seerat-un-Nabi", gradeLevel: "3-12" },
      { name: "Pillars of Islam", gradeLevel: "1-8" },
      { name: "Ethics and Morals", gradeLevel: "1-12" },
    ],
  },
  {
    name: "General Knowledge",
    nameUrdu: "عمومی علم",
    icon: "\u{1F30D}", // Earth globe Europe-Africa emoji
    topics: [
      { name: "Pakistan Studies", gradeLevel: "5-12" },
      { name: "World Geography", gradeLevel: "4-10" },
      { name: "Current Affairs", gradeLevel: "6-12" },
      { name: "Famous Personalities", gradeLevel: "3-10" },
      { name: "Sports", gradeLevel: "3-10" },
      { name: "Science and Technology", gradeLevel: "5-12" },
      { name: "History", gradeLevel: "4-12" },
    ],
  },
];

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.worksheetQuestion.deleteMany();
  await prisma.worksheet.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();

  console.log("Cleared existing data");

  // Create subjects and topics
  for (const subjectData of subjects) {
    const { topics, ...subject } = subjectData;

    const createdSubject = await prisma.subject.create({
      data: {
        ...subject,
        topics: {
          create: topics,
        },
      },
      include: {
        topics: true,
      },
    });

    console.log(
      `Created subject: ${createdSubject.name} with ${createdSubject.topics.length} topics`
    );
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
