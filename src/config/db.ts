import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DB_URL as string;

if (!dbUrl) {
  throw new Error("❌ DB_URL is not defined in environment variables!");
}


const dbConfig = new URL(dbUrl);

const pool = mysql.createPool({
  host: dbConfig.hostname, 
  user: dbConfig.username, 
  password: dbConfig.password,
  database: dbConfig.pathname.replace("/", ""),
  port: Number(dbConfig.port),
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(" Database connected successfully!");
    connection.release();
  } catch (error) {
    console.error(" Database connection failed:", error);
    process.exit(1); 
  }
};


const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS schools (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL
    );
  `;

  try {
    const connection = await pool.getConnection();
    await connection.query(createTableQuery);
    connection.release();
    console.log(" 'schools' table ensured.");
  } catch (error) {
    console.error(" Error creating table:", error);
  }
};


testDbConnection().then(() => createTable());

export { pool, testDbConnection };
