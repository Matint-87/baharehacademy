// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { Pool } from "pg";

// const connectionString = process.env.DATABASE_URL;

// // ایجاد یک نمونه ثابت برای کل پروژه
// const prismaClientSingleton = () => {
//   const pool = new Pool({ connectionString });
//   const adapter = new PrismaPg(pool);
//   return new PrismaClient({ adapter });
// };

// const globalForPrisma = global;

// // استفاده از سینگلتون برای جلوگیری از ایجاد چندین کانکشن در حالت توسعه
// export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // اختیاری برای دیدن کوئری‌ها در ترمینال
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}