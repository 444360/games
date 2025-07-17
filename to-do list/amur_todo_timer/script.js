document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeHearts = document.querySelectorAll('.theme-hearts i');
    const spotifyIcon = document.getElementById('spotify-icon');
    const itunesIcon = document.getElementById('itunes-icon');
    const bellIcon = document.getElementById('bell-icon');
    const addTaskBtn = document.getElementById('add-task-btn');
    const sortTasks = document.getElementById('sort-tasks');
    const todoList = document.getElementById('todo-list');
    const inProgressList = document.getElementById('in-progress-list');
    const completedList = document.getElementById('completed-list');
    const addTaskModal = document.getElementById('add-task-modal');
    const timerCompleteModal = document.getElementById('timer-complete-modal');
    const soundModal = document.getElementById('sound-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const taskForm = document.getElementById('task-form');
    const okBtn = document.querySelector('.ok-btn');
    const completedTaskName = document.getElementById('completed-task-name');
    const timerSound = document.getElementById('timer-sound');
    const soundOptions = document.querySelectorAll('.sound-option');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let activeTimers = {};
    let currentTheme = localStorage.getItem('theme')) || '1';
    let timerSoundSrc = localStorage.getItem('timerSound')) || 'notification.mp3';
    
    // Initialize
    applyTheme(currentTheme);
    renderAllTasks();
    setupDragAndDrop();
    
    // Event Listeners
    themeHearts.forEach(heart => {
        heart.addEventListener('click', () => changeTheme(heart.dataset.theme));
    });
    
    spotifyIcon.addEventListener('click', () => connectMusicService('spotify'));
    itunesIcon.addEventListener('click', () => connectMusicService('itunes'));
    bellIcon.addEventListener('click', () => soundModal.style.display = 'flex');
    
    addTaskBtn.addEventListener('click', () => addTaskModal.style.display = 'flex');
    sortTasks.addEventListener('change', sortAndRenderTasks);
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addTaskModal.style.display = 'none';
            soundModal.style.display = 'none';
        });
    });
    
    okBtn.addEventListener('click', () => {
        timerCompleteModal.style.display = 'none';
        timerSound.pause();
    });
    
    taskForm.addEventListener('submit', addNewTask);
    
    soundOptions.forEach(option => {
        option.addEventListener('click', () => {
            timerSoundSrc = option.dataset.sound;
            timerSound.src = timerSoundSrc;
            localStorage.setItem('timerSound', timerSoundSrc);
            soundModal.style.display = 'none';
        });
    });
    
    window.addEventListener('beforeunload', () => {
        // Save active timers' remaining time
        Object.keys(activeTimers).forEach(taskId => {
            const taskElement = document.querySelector(`[data-id="${taskId}"]`);
            if (taskElement) {
                const timeLeft = taskElement.querySelector('.timer-display').textContent;
                const [minutes, seconds] = timeLeft.split(':').map(Number);
                const totalSeconds = minutes * 60 + seconds;
                
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].timeLeft = totalSeconds;
                }
            }
        });
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
    });
    
    // Functions
    function applyTheme(themeNumber) {
        document.body.className = '';
        if (themeNumber !== '1') {
            document.body.classList.add(`theme-${themeNumber}`);
        }
        
        themeHearts.forEach(heart => {
            heart.classList.remove('active');
            if (heart.dataset.theme === themeNumber) {
                heart.classList.add('active');
            }
        });
    }
    
    function changeTheme(themeNumber) {
        currentTheme = themeNumber;
        localStorage.setItem('theme', themeNumber);
        applyTheme(themeNumber);
    }
    
    function connectMusicService(service) {
        const musicStatus = document.querySelector('.music-status');
        const musicControls = document.querySelector('.music-controls');
        
        musicStatus.textContent = `Connected to ${service.charAt(0).toUpperCase() + service.slice(1)}`;
        musicControls.classList.remove('hidden');
    }
    
    function addNewTask(e) {
        e.preventDefault();
        
        const taskName = document.getElementById('task-name').value;
        const priority = document.querySelector('input[name="priority"]:checked').value;
        const time = parseInt(document.getElementById('task-time').value);
        
        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            priority,
            time,
            status: 'todo',
            timeLeft: time * 60, // Store in seconds
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTask(newTask, todoList);
        
        taskForm.reset();
        addTaskModal.style.display = 'none';
    }
    
    function renderAllTasks() {
        // Clear all lists
        todoList.innerHTML = '';
        inProgressList.innerHTML = '';
        completedList.innerHTML = '';
        
        // Sort tasks before rendering
        sortAndRenderTasks();
    }
    
    function sortAndRenderTasks() {
        const sortValue = sortTasks.value;
        let sortedTasks = [...tasks];
        
        switch(sortValue) {
            case 'priority-high':
                sortedTasks.sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, normal: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
                break;
            case 'priority-low':
                sortedTasks.sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, normal: 1 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                });
                break;
            case 'name-asc':
                sortedTasks.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedTasks.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        
        // Clear all lists
        todoList.innerHTML = '';
        inProgressList.innerHTML = '';
        completedList.innerHTML = '';
        
        // Render each task in the appropriate list
        sortedTasks.forEach(task => {
            switch(task.status) {
                case 'todo':
                    renderTask(task, todoList);
                    break;
                case 'in-progress':
                    renderTask(task, inProgressList, true);
                    break;
                case 'completed':
                    renderTask(task, completedList, false, true);
                    break;
            }
        });
    }
    
    function renderTask(task, container, isInProgress = false, isCompleted = false) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${isCompleted ? 'completed-task' : ''}`;
        taskElement.dataset.id = task.id;
        taskElement.draggable = true;
        
        let prioritySymbol = '';
        let priorityClass = '';
        switch(task.priority) {
            case 'medium':
                prioritySymbol = '(!)';
                priorityClass = 'priority-medium';
                break;
            case 'high':
                prioritySymbol = '(!!)';
                priorityClass = 'priority-high';
                break;
            default:
                priorityClass = 'priority-normal';
        }
        
        if (isInProgress) {
            // For in-progress tasks, show timer and controls
            const totalSeconds = task.timeLeft || (task.time * 60);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-priority ${priorityClass}">${prioritySymbol}</div>
                </div>
                <div class="task-timer">
                    <span class="timer-display">${timeString}</span>
                    <i class="fas fa-play play-timer"></i>
                    <i class="fas fa-pause pause-timer"></i>
                </div>
                <div class="task-actions">
                    <i class="fas fa-trash delete-task"></i>
                </div>
            `;
            
            // If this task was previously running, restart the timer
            if (activeTimers[task.id]) {
                startTimer(task.id, task.timeLeft);
            }
        } else if (isCompleted) {
            // For completed tasks
            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-time">Completed in ${task.time} minutes</div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-check"></i>
                    <i class="fas fa-trash delete-task"></i>
                </div>
            `;
        } else {
            // For to-do tasks
            taskElement.innerHTML = `
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-priority ${priorityClass}">${prioritySymbol}</div>
                    <div class="task-time">${task.time} minutes</div>
                </div>
                <div class="task-actions">
                    <i class="fas fa-pen edit-task"></i>
                    <i class="fas fa-trash delete-task"></i>
                </div>
            `;
        }
        
        container.appendChild(taskElement);
        
        // Add event listeners to the buttons we just created
        if (isInProgress) {
            const playBtn = taskElement.querySelector('.play-timer');
            const pauseBtn = taskElement.querySelector('.pause-timer');
            
            playBtn.addEventListener('click', () => startTimer(task.id, task.timeLeft));
            pauseBtn.addEventListener('click', () => pauseTimer(task.id));
        }
        
        const deleteBtn = taskElement.querySelector('.delete-task');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        if (!isInProgress && !isCompleted) {
            const editBtn = taskElement.querySelector('.edit-task');
            editBtn.addEventListener('click', () => editTask(task.id));
        }
    }
    
    function startTimer(taskId, initialTime = null) {
        // Stop if already running
        if (activeTimers[taskId]) {
            clearInterval(activeTimers[taskId].interval);
        }
        
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (!taskElement) return;
        
        const timerDisplay = taskElement.querySelector('.timer-display');
        const playBtn = taskElement.querySelector('.play-timer');
        const pauseBtn = taskElement.querySelector('.pause-timer');
        
        let secondsLeft = initialTime || parseInt(timerDisplay.textContent.split(':')[0]) * 60 + 
                         parseInt(timerDisplay.textContent.split(':')[1]);
        
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        
        activeTimers[taskId] = {
            interval: setInterval(() => {
                secondsLeft--;
                
                const minutes = Math.floor(secondsLeft / 60);
                const seconds = secondsLeft % 60;
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Update the task's timeLeft in our tasks array
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].timeLeft = secondsLeft;
                }
                
                if (secondsLeft <= 0) {
                    clearInterval(activeTimers[taskId].interval);
                    delete activeTimers[taskId];
                    
                    // Move to completed
                    const taskIndex = tasks.findIndex(task => task.id === taskId);
                    if (taskIndex !== -1) {
                        tasks[taskIndex].status = 'completed';
                        saveTasks();
                        
                        // Play sound
                        timerSound.src = timerSoundSrc;
                        timerSound.play();
                        
                        // Show completion modal
                        completedTaskName.textContent = `"${tasks[taskIndex].name}"`;
                        timerCompleteModal.style.display = 'flex';
                        
                        // Re-render lists
                        renderAllTasks();
                    }
                }
            }, 1000),
            startTime: Date.now(),
            initialSeconds: secondsLeft
        };
    }
    
    function pauseTimer(taskId) {
        if (!activeTimers[taskId]) return;
        
        clearInterval(activeTimers[taskId].interval);
        delete activeTimers[taskId];
        
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (!taskElement) return;
        
        const playBtn = taskElement.querySelector('.play-timer');
        const pauseBtn = taskElement.querySelector('.pause-timer');
        
        playBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
    }
    
    function deleteTask(taskId) {
        // Stop timer if running
        if (activeTimers[taskId]) {
            clearInterval(activeTimers[taskId].interval);
            delete activeTimers[taskId];
        }
        
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderAllTasks();
    }
    
    function editTask(taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (!task) return;
        
        // For simplicity, we'll just delete and re-add with a modal
        deleteTask(taskId);
        
        document.getElementById('task-name').value = task.name;
        document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
        document.getElementById('task-time').value = task.time;
        
        addTaskModal.style.display = 'flex';
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function setupDragAndDrop() {
        const lists = [todoList, inProgressList, completedList];
        
        lists.forEach(list => {
            list.addEventListener('dragover', e => {
                e.preventDefault();
                const draggingItem = document.querySelector('.dragging');
                if (draggingItem) {
                    const afterElement = getDragAfterElement(list, e.clientY);
                    if (afterElement) {
                        list.insertBefore(draggingItem, afterElement);
                    } else {
                        list.appendChild(draggingItem);
                    }
                }
            });
        });
        
        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('dragstart', () => {
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                
                // Find which list the item is now in and update status
                const taskId = item.dataset.id;
                const newListId = item.parentElement.id;
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                
                if (taskIndex !== -1) {
                    let newStatus = 'todo';
                    if (newListId === 'in-progress-list') {
                        newStatus = 'in-progress';
                        
                        // If moving to in-progress, stop any existing timer for this task
                        if (activeTimers[taskId]) {
                            pauseTimer(taskId);
                        }
                    } else if (newListId === 'completed-list') {
                        newStatus = 'completed';
                        
                        // If moving to completed, stop timer if running
                        if (activeTimers[taskId]) {
                            clearInterval(activeTimers[taskId].interval);
                            delete activeTimers[taskId];
                        }
                    }
                    
                    // Only update if status changed
                    if (tasks[taskIndex].status !== newStatus) {
                        tasks[taskIndex].status = newStatus;
                        saveTasks();
                        
                        // If moving to in-progress, initialize the timer display
                        if (newStatus === 'in-progress') {
                            renderAllTasks();
                        }
                    }
                }
            });
        });
    }
    
    function getDragAfterElement(list, y) {
        const draggableElements = [...list.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    // Initialize timer sound
    timerSound.src = timerSoundSrc;
});