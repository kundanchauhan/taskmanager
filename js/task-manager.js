document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskDateInput = document.getElementById('task-date');
    const searchInput = document.getElementById('search-input');
    const taskList = document.getElementById('task-list');

    // Default date input to today
    const today = new Date().toISOString().split('T')[0];
    taskDateInput.value = today;

    // Storage Key
    const STORAGE_KEY = 'task_manager_data';

    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let searchQuery = '';

    // Save tasks to local storage
    const saveTasks = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    };

    // Helper to format date nicely
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // Handle timezone parsing properly by creating date at noon
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day, 12, 0, 0);
        return date.toLocaleDateString(undefined, options);
    };

    // Render tasks
    const renderTasks = () => {
        taskList.innerHTML = '';
        
        // Filter tasks based on search query
        const filteredTasks = tasks.filter(task => 
            task.text.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <p>${searchQuery ? 'No tasks match your search.' : 'You have no tasks here. Add one above!'}</p>
                </div>
            `;
            return;
        }

        // Group tasks by date
        const groupedTasks = filteredTasks.reduce((acc, task) => {
            const date = task.date || today;
            if (!acc[date]) acc[date] = [];
            acc[date].push(task);
            return acc;
        }, {});

        // Sort dates descending (newest first)
        const sortedDates = Object.keys(groupedTasks).sort((a, b) => b.localeCompare(a));

        sortedDates.forEach(date => {
            // Render date header
            const headerEl = document.createElement('div');
            headerEl.className = 'date-header';
            
            // Check if it's today
            let headerText = formatDate(date);
            if (date === today) {
                headerText += ' (Today)';
            }
            
            headerEl.textContent = headerText;
            taskList.appendChild(headerEl);

            // Sort tasks within this date descending by createdAt
            const tasksForDate = groupedTasks[date].sort((a, b) => b.createdAt - a.createdAt);

            tasksForDate.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.className = `glass-card task-item ${task.completed ? 'completed' : ''}`;
                taskEl.dataset.id = task.id;

                taskEl.innerHTML = `
                    <div class="task-content">
                        <label class="custom-checkbox">
                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                            <svg class="checkbox-svg" viewBox="0 0 24 24">
                                <path d="M5 12l5 5L20 7"></path>
                            </svg>
                        </label>
                        <span class="task-text">${escapeHTML(task.text)}</span>
                    </div>
                    <button class="delete-btn" aria-label="Delete task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                `;

                // Toggle completion
                const checkbox = taskEl.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => {
                    toggleTask(task.id);
                });

                // Delete task
                const deleteBtn = taskEl.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => {
                    deleteTask(task.id);
                });

                taskList.appendChild(taskEl);
            });
        });
    };

    // Add new task
    const addTask = (text, date) => {
        const newTask = {
            id: Date.now().toString(),
            text: text,
            date: date || today,
            completed: false,
            createdAt: Date.now()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
    };

    // Toggle task status
    const toggleTask = (id) => {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    };

    // Delete task
    const deleteTask = (id) => {
        // Add a small exit animation before actually deleting
        const taskEl = document.querySelector(`.task-item[data-id="${id}"]`);
        if (taskEl) {
            taskEl.style.transform = 'translateX(20px)';
            taskEl.style.opacity = '0';
            
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                renderTasks();
            }, 300);
        } else {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }
    };

    // Handle Enter key for textarea
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            taskForm.requestSubmit();
        }
    });

    // Handle form submit
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const date = taskDateInput.value;
        
        if (text) {
            addTask(text, date);
            taskInput.value = '';
            // keep the date input as is to quickly add multiple for the same day
        }
    });

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderTasks();
    });

    // Utility: Prevent XSS
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Initial render
    renderTasks();
});
