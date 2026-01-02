const dotenv = require("dotenv");
dotenv.config();

/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: "./db/schema.js",
    dialect: "postgresql",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    }
};
