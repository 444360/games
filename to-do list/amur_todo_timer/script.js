// ========== DOM ELEMENTS ========== //
const themeButtons = document.querySelectorAll('.theme-switcher i');
const soundBtn = document.getElementById('sound-btn');
const undoBtn = document.getElementById('undo-btn');
const infoBtn = document.getElementById('info-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const closeTaskModal = document.getElementById('close-task-modal');
const closeSoundModal = document.getElementById('close-sound-modal');
const closeInfoModal = document.getElementById('close-info-modal');
const closeAlertBtn = document.getElementById('close-alert-btn');
const taskModal = document.getElementById('task-modal');
const soundModal = document.getElementById('sound-modal');
const infoModal = document.getElementById('info-modal');
const alertModal = document.getElementById('alert-modal');
const taskForm = document.getElementById('task-form');
const todoList = document.getElementById('todo-list');
const inProgressList = document.getElementById('in-progress-list');
const completedList = document.getElementById('completed-list');
const todoSort = document.getElementById('todo-sort');
const progressSort = document.getElementById('progress-sort');
const alarmSoundSelect = document.getElementById('alarm-sound');
const testSoundBtn = document.getElementById('test-sound-btn');
const saveSoundBtn = document.getElementById('save-sound-btn');
const alarmSoundElement = document.getElementById('alarm-sound-element');
const copyrightYear = document.querySelector('.copyright');

// ========== STATE ========== //
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let activeTimers = {};
let currentTheme = localStorage.getItem('theme') || '1';
let alarmSound = localStorage.getItem('alarmSound') || 'bell';
let formSubmitListenerAttached = false;

// ========== INITIALIZATION ========== //
function init() {
    setupEventListeners();
    renderTasks();
    setTheme(currentTheme);
    setCopyrightYear();
    
    tasks.filter(task => task.status === 'in-progress').forEach(task => {
        if (!task.timeLeft) task.timeLeft = task.time * 60;
        startTimer(task.id);
    });
}

function setCopyrightYear() {
    const year = new Date().getFullYear();
    copyrightYear.textContent = `© ${year} AmurList. All rights reserved.`;
}

// ========== TASK FUNCTIONS ========== //
function createTask(name, priority, time) {
    const newTask = {
        id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: name.trim(),
        priority,
        time: parseInt(time),
        status: 'todo',
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

function startTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = 'in-progress';
        task.timeLeft = task.time * 60;
        saveTasks();
        renderTasks();
        startTimer(taskId);
    }
}

function deleteTask(taskId) {
    stopTimer(taskId);
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

// ========== TIMER FUNCTIONS ========== //
function startTimer(taskId) {
    stopTimer(taskId);
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    if (!tasks[taskIndex].timeLeft) {
        tasks[taskIndex].timeLeft = tasks[taskIndex].time * 60;
    }

    updateTimerDisplay(taskId);
    
    activeTimers[taskId] = setInterval(() => {
        tasks[taskIndex].timeLeft--;
        updateTimerDisplay(taskId);
        
        if (tasks[taskIndex].timeLeft <= 0) {
            stopTimer(taskId);
            tasks[taskIndex].status = 'completed';
            saveTasks();
            renderTasks();
            playAlarmSound();
            document.getElementById('alert-message').textContent = `Timer for "${tasks[taskIndex].name}" is over!`;
            alertModal.style.display = 'flex';
        }
    }, 1000);
}

function stopTimer(taskId) {
    if (activeTimers[taskId]) {
        clearInterval(activeTimers[taskId]);
        delete activeTimers[taskId];
    }
}

function updateTimerDisplay(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
    if (taskElement) {
        const minutes = Math.floor(task.timeLeft / 60);
        const seconds = task.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const timerElement = taskElement.querySelector('.task-timer');
        if (timerElement) {
            timerElement.textContent = timeString;
        }
    }
}

// ========== RENDER FUNCTIONS ========== //
function renderTasks() {
    renderTaskList(todoList, tasks.filter(task => task.status === 'todo'));
    renderTaskList(inProgressList, tasks.filter(task => task.status === 'in-progress'), true);
    renderTaskList(completedList, tasks.filter(task => task.status === 'completed'), false, true);
}

function renderTaskList(container, taskSubset, isInProgress = false, isCompleted = false) {
    container.innerHTML = '';
    
    taskSubset.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.dataset.id = task.id;
        
        if (isInProgress) {
            const minutes = Math.floor(task.timeLeft / 60);
            const seconds = task.timeLeft % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-name ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : ''}">
                        ${task.name}
                    </div>
                    <div class="task-timer">${timeString}</div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-play play-btn" title="Start Timer"></i>
                    <i class="fas fa-pause pause-btn" title="Pause Timer"></i>
                    <i class="fas fa-trash-alt delete-btn" title="Delete Task"></i>
                </div>
            `;
            
            taskElement.querySelector('.play-btn').addEventListener('click', () => startTimer(task.id));
            taskElement.querySelector('.pause-btn').addEventListener('click', () => stopTimer(task.id));
        } 
        else if (isCompleted) {
            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-name ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : ''}">
                        ${task.name}
                    </div>
                    <div class="task-time">Completed in ${task.time} min</div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-check" title="Completed"></i>
                    <i class="fas fa-trash-alt delete-btn" title="Delete Task"></i>
                </div>
            `;
        } 
        else {
            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-name ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : ''}">
                        ${task.name}
                    </div>
                    <div class="task-time">${task.time} min</div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-play-circle move-btn" title="Start Task"></i>
                    <i class="fas fa-trash-alt delete-btn" title="Delete Task"></i>
                </div>
            `;
            
            taskElement.querySelector('.move-btn').addEventListener('click', () => startTask(task.id));
        }
        
        taskElement.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
        container.appendChild(taskElement);
    });
}

// ========== THEME FUNCTIONS ========== //
function setTheme(theme) {
    themeButtons.forEach(b => b.classList.remove('active-theme'));
    document.querySelector(`.theme-switcher i[data-theme="${theme}"]`).classList.add('active-theme');
    
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    let bgColor, headerColor;
    
    switch(theme) {
        case '1': bgColor = '#F7E9E9FF'; headerColor = '#eac4d5'; break;
        case '2': bgColor = '#d6eadf'; headerColor = '#b8e0d2'; break;
        case '3': bgColor = '#aec6cf'; headerColor = '#a2bffe'; break;
        case '4': bgColor = '#f0e6ff'; headerColor = '#d4b8ff'; break;
        case '5': bgColor = '#fff5e6'; headerColor = '#ffe5b8'; break;
        case '6': bgColor = '#e0e0e0'; headerColor = '#a0a0a0'; break;
        default: bgColor = '#F7E9E9FF'; headerColor = '#eac4d5';
    }
    
    document.body.style.backgroundColor = bgColor;
    document.querySelectorAll('.header-section, .task-column, .footer').forEach(el => {
        el.style.backgroundColor = headerColor;
    });
    
    document.querySelectorAll('.submit-btn, .alert-modal button').forEach(btn => {
        btn.style.backgroundColor = headerColor;
    });
}

// ========== EVENT HANDLERS ========== //
function setupEventListeners() {
    // Theme switcher
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });

    // Modals
    addTaskBtn.addEventListener('click', () => taskModal.style.display = 'flex');
    soundBtn.addEventListener('click', () => soundModal.style.display = 'flex');
    infoBtn.addEventListener('click', () => infoModal.style.display = 'flex');

    // Close buttons
    closeTaskModal.addEventListener('click', () => taskModal.style.display = 'none');
    closeSoundModal.addEventListener('click', () => soundModal.style.display = 'none');
    closeInfoModal.addEventListener('click', () => infoModal.style.display = 'none');
    closeAlertBtn.addEventListener('click', () => alertModal.style.display = 'none');

    // Form (Add task) submission
    if (!formSubmitListenerAttached) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;
            
            const taskName = document.getElementById('task-name').value;
            const priority = document.querySelector('input[name="priority"]:checked').value;
            const time = document.getElementById('task-time').value;
            
            if (!taskName.trim() || isNaN(time) || time < 1) {
                alert('Please enter valid task details');
                submitBtn.disabled = false;
                return;
            }

            createTask(taskName, priority, time);
            
            taskForm.reset();
            taskModal.style.display = 'none';
            submitBtn.disabled = false;
        });
        formSubmitListenerAttached = true;
    }

    // Other buttons
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    undoBtn.addEventListener('click', undoLastAction);
    testSoundBtn.addEventListener('click', playAlarmSound);
    saveSoundBtn.addEventListener('click', saveAlarmSound);
    
    // Sorting
    todoSort.addEventListener('change', () => sortTasks('todo', todoSort.value));
    progressSort.addEventListener('change', () => sortTasks('in-progress', progressSort.value));
    

    window.addEventListener('click', (e) => {
        if (e.target === taskModal) taskModal.style.display = 'none';
        if (e.target === soundModal) soundModal.style.display = 'none';
        if (e.target === infoModal) infoModal.style.display = 'none';
        if (e.target === alertModal) alertModal.style.display = 'none';
    });
}

// ========== UTILITY FUNCTIONS ========== //
function sortTasks(column, sortBy) {
    let taskSubset = [];
    let listElement = null;
    
    if (column === 'todo') {
        taskSubset = tasks.filter(task => task.status === 'todo');
        listElement = todoList;
    } else if (column === 'in-progress') {
        taskSubset = tasks.filter(task => task.status === 'in-progress');
        listElement = inProgressList;
    } else {
        return;
    }
    
    switch(sortBy) {
        case 'priority-high':
            taskSubset.sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'normal': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            break;
        case 'priority-low':
            taskSubset.sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'normal': 1 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            break;
        case 'name-asc':
            taskSubset.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            taskSubset.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'time-asc':
            taskSubset.sort((a, b) => (a.timeLeft || a.time * 60) - (b.timeLeft || b.time * 60));
            break;
        case 'time-desc':
            taskSubset.sort((a, b) => (b.timeLeft || b.time * 60) - (a.timeLeft || a.time * 60));
            break;
    }
    
    renderTaskList(listElement, taskSubset, column === 'in-progress');
}

function clearCompletedTasks() {
    tasks = tasks.filter(task => task.status !== 'completed');
    saveTasks();
    renderTasks();
}

function undoLastAction() {
    if (tasks.length > 0) {
        tasks.pop();
        saveTasks();
        renderTasks();
    }
}

function playAlarmSound() {
    alarmSoundElement.currentTime = 0;
    alarmSoundElement.play();
}

function saveAlarmSound() {
    alarmSound = alarmSoundSelect.value;
    localStorage.setItem('alarmSound', alarmSound);
    alarmSoundElement.src = "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3";
    soundModal.style.display = 'none';
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

init();