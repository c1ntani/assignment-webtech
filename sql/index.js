const sqlite3 = require("sqlite3").verbose();

const queries = require("./queries");

// Function to connect to SQL database
const sql = () => {
  const db = new sqlite3.Database(
    "./database.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error("Error loading database : ", err.message);
      }
    }
  );

  return db;
};

module.exports = sql;
