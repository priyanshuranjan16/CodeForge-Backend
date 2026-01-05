const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_POOL_URL,
    // Connection pool settings
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection not established
});

// Handle pool errors to prevent crashes
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
    // Don't exit - the pool will handle reconnection
});

const connectDB = async () => {
    try {
        // Test the connection
        const client = await pool.connect();
        console.log("Connected to PostgreSQL database");
        client.release(); // Release back to pool
    } catch (error) {
        console.error("Database connection error:", error);
        setTimeout(connectDB, 5000);
    }
}

connectDB();

const db = drizzle(pool);

module.exports = db;
