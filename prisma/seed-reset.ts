import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function resetDatabase() {
  console.log("🗑️  Starting database reset...");

  try {
    // Delete all data in reverse order of table creation (respecting foreign keys)
    console.log("Deleting all records...");

    await prisma.whatsAppLog.deleteMany({});
    await prisma.midtransWebhookLog.deleteMany({});
    await prisma.onlinePaymentItem.deleteMany({});
    await prisma.onlinePayment.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.tuition.deleteMany({});
    await prisma.serviceFeeBill.deleteMany({});
    await prisma.feeBill.deleteMany({});
    await prisma.serviceFee.deleteMany({});
    await prisma.feeSubscription.deleteMany({});
    await prisma.feeServicePrice.deleteMany({});
    await prisma.feeService.deleteMany({});
    await prisma.discount.deleteMany({});
    await prisma.scholarship.deleteMany({});
    await prisma.studentClass.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.classAcademic.deleteMany({});
    await prisma.academicYear.deleteMany({});
    await prisma.paymentSetting.deleteMany({});
    await prisma.idempotencyRecord.deleteMany({});
    await prisma.rateLimitRecord.deleteMany({});
    await prisma.employee.deleteMany({});

    console.log("✓ All records deleted");
  } catch (error) {
    console.error("Error deleting records:", error);
    throw error;
  }
}

async function createSuperAdmin() {
  console.log("👤 Creating super admin account...");

  const email = "admin@ahmadyani.ac.id";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.employee.create({
    data: {
      name: "Super Administrator",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✓ Super admin created");
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  ID: ${admin.employeeId}`);

  return admin;
}

async function main() {
  console.log("=".repeat(50));
  console.log("DATABASE RESET SCRIPT");
  console.log("=".repeat(50));
  console.log();

  try {
    await resetDatabase();
    await createSuperAdmin();

    console.log();
    console.log("=".repeat(50));
    console.log("✅ Database reset completed successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ Reset failed:", error);
    process.exit(1);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
