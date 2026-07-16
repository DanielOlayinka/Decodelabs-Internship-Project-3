// script.js
// Talks to the Express/SQLite backend to perform CRUD operations,
// and renders the task list in the DOM.

// Change this if your backend runs on a different host/port.
const API_URL = 'http://localhost:3000/api/tasks';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');

// ---------- READ: load all tasks on page load ----------
async function loadTasks() {
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error('Failed to load tasks:', err);
    alert('Could not reach the server. Is the backend running on port 3000?');
  }
}

// ---------- CREATE: add a new task ----------
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error('Failed to create task');

    taskInput.value = '';
    loadTasks(); // refresh the list from the server
  } catch (err) {
    console.error(err);
    alert('Could not add the task.');
  }
});

// ---------- UPDATE: toggle completed ----------
async function toggleTask(id, completed) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    loadTasks();
  } catch (err) {
    console.error(err);
    alert('Could not update the task.');
  }
}

// ---------- DELETE: remove a task ----------
async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadTasks();
  } catch (err) {
    console.error(err);
    alert('Could not delete the task.');
  }
}

// ---------- Render helper ----------
function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

    const span = document.createElement('span');
    span.textContent = task.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

// Kick things off
loadTasks();
