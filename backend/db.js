// db.js
// Sets up the SQLite database connection and defines the schema.

const Database = require('better-sqlite3');
const path = require('path');

// This creates (or opens, if it already exists) a file called todo.db
// in the backend folder. That file IS the database.
const db = new Database(path.join(__dirname, 'todo.db'));

// ---- SCHEMA ----
// One simple table: tasks
//   id          -> unique identifier, auto-incremented
//   title       -> the text of the task (required)
//   completed   -> 0 (false) or 1 (true)
//   created_at  -> timestamp, set automatically when a row is inserted
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
