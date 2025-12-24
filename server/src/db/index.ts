
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "user",
  password: "password",
  port: 3306,
  database: "workshop_db",
});

// test the db connection
export const testDB = async () => {
  try {
    await db.query("SELECT 1");
    console.log("MySQL connected");
  } catch (err) {
    console.error("MySQL connection failed", err);
  }
};
