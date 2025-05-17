document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const priorityTabs = document.querySelectorAll('.priority-tab');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-text');
    const themeToggle = document.getElementById('theme-toggle');
    const exportBtn = document.getElementById('export-btn');


    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentPriority = 'normal';
    let currentFilter = 'all';
    let currentTheme = localStorage.getItem('theme') || 'light';

  
    setTheme(currentTheme);
    renderTasks();
    updateStats();

    
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    priorityTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            priorityTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPriority = tab.dataset.priority;
        });
    });
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    themeToggle.addEventListener('click', toggleTheme);
    exportBtn.addEventListener('click', exportTasks);


    function addTask() {
        const text = taskInput.value.trim();
        
        if (text) {
            const task = {
                id: Date.now(),
                text,
                priority: currentPriority,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.unshift(task);
            saveTasks();
            renderTasks();
            updateStats();
            taskInput.value = '';
            animateAddButton();
        }
    }

    function animateAddButton() {
        addTaskBtn.innerHTML = '<i class="fas fa-check"></i> Added';
        addTaskBtn.style.backgroundColor = 'var(--completed)';
        setTimeout(() => {
            addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
            addTaskBtn.style.backgroundColor = '';
        }, 1500);
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                const checkbox = taskItem.querySelector('.task-checkbox');
                const editBtn = taskItem.querySelector('.edit-btn');
                const deleteBtn = taskItem.querySelector('.delete-btn');
                
                checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
                editBtn.addEventListener('click', () => openEditModal(task));
                deleteBtn.addEventListener('click', () => deleteTask(task.id));
                
                taskList.appendChild(taskItem);
            });
        }
    }

    function toggleTaskComplete(id) {
        tasks = tasks.map(task => 
            task.id === id ? {...task, completed: !task.completed} : task
        );
        saveTasks();
        renderTasks();
        updateStats();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        progressBar.style.setProperty('--progress', `${percentage}%`);
        progressText.textContent = `${percentage}% Complete`;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.innerHTML = theme === 'light' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }

    function exportTasks() {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `tasks-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        
        exportBtn.innerHTML = '<i class="fas fa-check"></i> Exported';
        setTimeout(() => {
            exportBtn.innerHTML = '<i class="fas fa-file-export"></i>';
        }, 1500);
    }

    function openEditModal(task) {
        const newText = prompt("Edit task:", task.text);
        if (newText !== null && newText.trim() !== '') {
            tasks = tasks.map(t => 
                t.id === task.id ? {...t, text: newText.trim()} : t
            );
            saveTasks();
            renderTasks();
        }
    }
});
