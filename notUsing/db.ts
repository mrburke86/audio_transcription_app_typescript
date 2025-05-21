// // src/utils/db.ts
// import { Pool as PgPool } from "pg";

// let pool: PgPool | null = null;
// let Pool: typeof PgPool | null = null;

// export const getPool = async () => {
//     if (typeof window === "undefined" && !Pool) {
//         const { Pool: ImportedPool } = await import("pg");
//         Pool = ImportedPool;
//     }
//     if (!pool && Pool) {
//         pool = new Pool({
//             connectionString: process.env.DATABASE_URL,
//         });
//     }
//     return pool;
// };

// export const query = async (text: string, params?: unknown[]) => {
//     if (typeof window !== "undefined") {
//         throw new Error("Database queries can only be run on the server side");
//     }
//     const pool = await getPool();
//     if (!pool) {
//         throw new Error("Failed to initialize database pool");
//     }
//     const client = await pool.connect();
//     try {
//         const res = await client.query(text, params);
//         return res;
//     } finally {
//         client.release();
//     }
// };
