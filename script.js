const taskInput = document.getElementById('task-input');
const taskDeadline = document.getElementById('task-deadline');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const reminderSound = document.getElementById('reminder-sound');

document.addEventListener('DOMContentLoaded', loadTasks);
addBtn.addEventListener('click', addTask);

// Request Notification permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

function addTask() {
  const text = taskInput.value.trim();
  const deadline = taskDeadline.value;

  if (text === '' || deadline === '') {
    alert('Please enter both task and deadline!');
    return;
  }

  const task = {
    text,
    deadline,
    completed: false
  };

  displayTask(task);
  saveTask(task);

  taskInput.value = '';
  taskDeadline.value = '';
}

function displayTask(task) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span>${task.text}</span>
    <small>⏰ ${new Date(task.deadline).toLocaleString()}</small>
    <div>
      <button class="complete-btn">✅</button>
      <button class="delete-btn">❌</button>
    </div>
  `;

  if (task.completed) li.classList.add('completed');

  li.querySelector('.complete-btn').addEventListener('click', () => {
    li.classList.toggle('completed');
    task.completed = !task.completed;
    updateStorage();
  });

  li.querySelector('.delete-btn').addEventListener('click', () => {
    li.remove();
    updateStorage();
  });

  taskList.appendChild(li);
}

function saveTask(task) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(displayTask);
}

function updateStorage() {
  const allTasks = [];
  document.querySelectorAll('li').forEach(li => {
    allTasks.push({
      text: li.querySelector('span').textContent,
      deadline: li.querySelector('small').textContent.replace('⏰ ', ''),
      completed: li.classList.contains('completed')
    });
  });
  localStorage.setItem('tasks', JSON.stringify(allTasks));
}

// 🔔 Reminder Checker every 30 seconds
setInterval(() => {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const now = new Date();

  tasks.forEach(task => {
    const taskTime = new Date(task.deadline);
    if (!task.completed && now > taskTime) {
      showNotification(task.text);
    }
  });
}, 30000);

function showNotification(taskText) {
  // Play sound when reminder pops up
  reminderSound.play().catch(err => console.log("Audio play prevented:", err));

  if (Notification.permission === "granted") {
    new Notification("⏰ Task Reminder", {
      body: `Your task "${taskText}" is pending!`,
      icon: "https://cdn-icons-png.flaticon.com/512/906/906343.png"
    });
  } else {
    alert(`Reminder: Your task "${taskText}" is pending!`);
  }
}
