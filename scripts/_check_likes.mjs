import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

const likes = await prisma.tbemergencylikes.findMany();
const views = await prisma.tbemergencyviews.findMany();
console.log("likes:", JSON.stringify(likes));
console.log("views:", JSON.stringify(views));

await prisma.$disconnect();
