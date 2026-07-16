// server.js
// Express server exposing CRUD REST endpoints for the "tasks" table.

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());            // allows the frontend (different origin/port) to call this API
app.use(express.json());    // parses incoming JSON request bodies

// ---------- CREATE ----------
// POST /api/tasks   body: { "title": "Buy milk" }
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'A non-empty "title" is required.' });
  }

  const stmt = db.prepare('INSERT INTO tasks (title) VALUES (?)');
  const result = stmt.run(title.trim());

  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTask);
});

// ---------- READ (all) ----------
// GET /api/tasks
app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  res.json(tasks);
});

// ---------- READ (single) ----------
// GET /api/tasks/:id
app.get('/api/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }
  res.json(task);
});

// ---------- UPDATE ----------
// PUT /api/tasks/:id   body: { "title": "New text", "completed": true }
// Both fields are optional — only what's sent gets updated.
app.put('/api/tasks/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const title = req.body.title !== undefined ? req.body.title.trim() : existing.title;
  const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : existing.completed;

  if (!title) {
    return res.status(400).json({ error: '"title" cannot be empty.' });
  }

  db.prepare('UPDATE tasks SET title = ?, completed = ? WHERE id = ?')
    .run(title, completed, req.params.id);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ---------- DELETE ----------
// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).send(); // no content
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
