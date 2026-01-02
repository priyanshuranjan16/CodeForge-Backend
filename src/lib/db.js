const { drizzle } = require('drizzle-orm/node-postgres');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_POOL_URL,
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL database");
    } catch (error) {
        console.error("Database connection error:", error);
    }
}

connectDB();

const db = drizzle(client);

module.exports = db;
