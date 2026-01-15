document.addEventListener('DOMContentLoaded', () => {
    // DOM
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const pageTitle = document.getElementById('pageTitle');

    // Containers
    const dashboardView = document.getElementById('dashboardView');
    const mytaskView = document.getElementById('mytaskView');

    // Lists & Stats
    const dashboardTaskList = document.getElementById('dashboardTaskList');
    const fullPendingList = document.getElementById('fullPendingList');
    const fullCompletedList = document.getElementById('fullCompletedList');

    const statTotal = document.getElementById('statTotal');
    const statCompleted = document.getElementById('statCompleted');
    const statPending = document.getElementById('statPending');

    const countPending = document.getElementById('countPending');
    const countCompleted = document.getElementById('countCompleted');

    // Modal
    const modal = document.getElementById('taskModal');
    const modalInput = document.getElementById('modalInput');
    const btnSave = document.getElementById('modalSave');
    const btnCancel = document.getElementById('modalCancel');

    // State
    let tasks = JSON.parse(localStorage.getItem('dp-todo-tasks')) || [];
    let currentView = 'dashboard';

    // Init
    initEvents();
    setDate();
    render();

    function initEvents() {
        // Nav Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchView(link.dataset.view);
                // Update active link state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                // Close sidebar on mobile
                closeSidebar();
            });
        });

        // View All Link
        document.querySelector('.view-all-link').addEventListener('click', (e) => {
            e.preventDefault();
            // Find "My Task" link and click it to switch state cleanly
            document.querySelector('.nav-link[data-view="mytask"]').click();
        });

        // Sidebar Toggles
        document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
        document.getElementById('sidebarCollapseBtn').addEventListener('click', toggleCollapse); // Updated ID
        overlay.addEventListener('click', closeSidebar);

        // Task Actions
        document.getElementById('sidebarAddBtn').addEventListener('click', openModal);
        btnCancel.addEventListener('click', closeModal);
        btnSave.addEventListener('click', saveTask);
        window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
        modalInput.addEventListener('keypress', e => { if (e.key === 'Enter') saveTask(); });
    }

    function switchView(viewName) {
        currentView = viewName;
        pageTitle.textContent = viewName === 'dashboard' ? 'Dashboard' : 'My Task';

        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.remove('active');
            el.classList.add('hidden');
        });

        // Show target
        const target = document.getElementById(viewName + 'View');
        target.classList.remove('hidden');
        target.classList.add('active');

        render();
    }

    // --- Core Logic ---

    function saveTask() {
        const text = modalInput.value.trim();
        if (!text) return;

        tasks.unshift({
            id: Date.now(),
            text: text,
            isCompleted: false,
            createdAt: new Date().toISOString()
        });

        updateStorage();
        closeModal();
    }

    function toggleTask(id) {
        tasks = tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
        updateStorage();
    }

    function deleteTask(id) {
        // Removed confirmation as per user request to "fix" it (make it instant/work better)
        tasks = tasks.filter(t => t.id !== id);
        updateStorage();
    }

    function updateStorage() {
        localStorage.setItem('dp-todo-tasks', JSON.stringify(tasks));
        render();
    }

    // --- Rendering ---

    function render() {
        // Calculate Stats
        const total = tasks.length;
        const completed = tasks.filter(t => t.isCompleted).length;
        const pending = total - completed;

        statTotal.textContent = total;
        statCompleted.textContent = completed;
        statPending.textContent = pending;

        countPending.textContent = pending;
        countCompleted.textContent = completed;

        const pendingTasks = tasks.filter(t => !t.isCompleted);
        const completedTasks = tasks.filter(t => t.isCompleted);

        // Render Dashboard: Top 5 Active
        renderList(dashboardTaskList, pendingTasks.slice(0, 5));

        // Render My Task: Full Lists
        renderList(fullPendingList, pendingTasks);
        renderList(fullCompletedList, completedTasks);
    }

    function renderList(container, list) {
        container.innerHTML = '';
        list.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';

            const checkClass = task.isCompleted ? 'task-check completed' : 'task-check';

            li.innerHTML = `
                <div class="${checkClass}" onclick="triggerToggle(${task.id})"></div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="triggerDelete(${task.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            container.appendChild(li);
        });
    }

    // --- Sidebar ---
    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }
    function toggleCollapse() {
        sidebar.classList.toggle('collapsed');
    }

    // --- Modal ---
    function openModal() {
        modal.classList.add('show');
        modalInput.focus();
    }
    function closeModal() {
        modal.classList.remove('show');
        modalInput.value = '';
    }

    // --- Utils ---
    function setDate() {
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Global Exposure
    window.triggerToggle = toggleTask;
    window.triggerDelete = deleteTask;
});
