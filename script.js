// ========== SUPABASE INITIALIZATION ==========
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://teafrrntffzraoiuurie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWZycm50ZmZ6cmFvaXV1cmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTMwMzgsImV4cCI6MjA2OTE2OTAzOH0.EZ7Lkxo_H1lZMMMH9OmjqKm3ALcIRripTzYrz7FosZs';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== SIDEBAR NAVIGATION ==========
const dashboardLink = document.getElementById('dashboardLink');
const financeLink = document.getElementById('financeLink');
const todoLink = document.getElementById('todoListLink');
const notesLink = document.getElementById('notesLink');
const contactsLink = document.getElementById('contactsLink');

const dashboardSection = document.getElementById('dashboardSection');
const financeSection = document.getElementById('financeSection');
const todoSection = document.getElementById('todoSection');
const notesSection = document.getElementById('notesSection');
const contactsSection = document.getElementById('contactsSection');

const sidebarLinks = document.querySelectorAll('.sidebar ul li a');

/**
 * Hide all main content sections
 */
function hideAllSections() {
  dashboardSection.style.display = 'none';
  financeSection.style.display = 'none';
  todoSection.style.display = 'none';
  notesSection.style.display = 'none';
  contactsSection.style.display = 'none';
}

/**
 * Remove 'active' classes from all sidebar links
 */
function clearSidebarActive() {
  sidebarLinks.forEach(link => link.classList.remove('active'));
}

dashboardLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  dashboardSection.style.display = 'block';
  clearSidebarActive();
  dashboardLink.classList.add('active');
};

financeLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  financeSection.style.display = 'block';
  clearSidebarActive();
  financeLink.classList.add('active');
};

todoLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  todoSection.style.display = 'block';
  clearSidebarActive();
  todoLink.classList.add('active');
  loadTodos(); // Load todos when showing todo section
};

notesLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  notesSection.style.display = 'block';
  clearSidebarActive();
  notesLink.classList.add('active');
};

contactsLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  contactsSection.style.display = 'block';
  clearSidebarActive();
  contactsLink.classList.add('active');
  loadContacts(); // Load contacts when showing contacts section
};

window.onload = function() {
  hideAllSections();
  dashboardSection.style.display = 'block';
  clearSidebarActive();
  dashboardLink.classList.add('active');
  loadTodos();
  loadContacts();
};

// ====== Helpers for formatting =======
function formatStatus(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== TODO LIST ==========

/**
 * Fetch and render todo items from Supabase
 */
async function loadTodos() {
  const tbody = document.querySelector('#todoTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;">Loading...</td></tr>';
  const { data: todos, error } = await supabase.from('todos').select('*').order('id', { ascending: true });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red;">Error loading todos</td></tr>`;
    return;
  }
  if (!todos || todos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:#888;">No todo tasks yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = '';
  todos.forEach(todo => {
    const tr = document.createElement('tr');
    tr.dataset.id = todo.id;
    tr.innerHTML = `
      <td><input type="checkbox" /></td>
      <td>
        <img class="avatar" src="${todo.assigned_avatar}" alt="${todo.assigned_to}" />
        ${todo.title}
      </td>
      <td><span class="status-label ${todo.status}">${formatStatus(todo.status)}</span></td>
      <td>
        <img class="avatar" src="${todo.assigned_avatar}" alt="${todo.assigned_to}" />
        ${todo.assigned_to}
      </td>
      <td>${todo.deadline}</td>
      <td><span class="priority-label ${todo.priority}">${capitalize(todo.priority)}</span></td>
      <td class="actions">
        <button class="edit" title="Edit" data-id="${todo.id}">&#9998;</button>
        <button class="delete" title="Delete" data-id="${todo.id}">&#10005;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Add Task Modal Handling ---
const addModal = document.getElementById('addModal');
const addModalClose = document.getElementById('addModalClose');
const addModalCancel = document.getElementById('addModalCancel');
const addTodoForm = document.getElementById('addTodoForm');
const addTaskBtn = document.querySelector('.add-task-btn');

if (addTaskBtn) {
  addTaskBtn.addEventListener('click', function () {
    addModal.style.display = 'block';
    addTodoForm.reset();
  });
}
function closeAddModal() { addModal.style.display = 'none'; }
addModalClose?.addEventListener('click', closeAddModal);
addModalCancel?.addEventListener('click', closeAddModal);
window.addEventListener('click', (event) => { if (event.target === addModal) closeAddModal(); });

addTodoForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const title = document.getElementById('addTitle').value;
  const statusValue = document.getElementById('addStatus').value;
  const assignedTo = document.getElementById('addAssignedTo').value;
  const assignedAvatar = document.getElementById('addAssignedAvatar').value;
  const deadline = document.getElementById('addDeadline').value;
  const priorityValue = document.getElementById('addPriority').value;
  const { error } = await supabase.from('todos').insert([{
    title, status: statusValue, assigned_to: assignedTo,
    assigned_avatar: assignedAvatar, deadline, priority: priorityValue
  }]);
  if (error) alert('Add failed! ' + error.message);
  else {
    closeAddModal();
    loadTodos();
  }
});

// --- Edit Task Modal Handling ---
const editModal = document.getElementById('editModal');
const editModalClose = document.getElementById('editModalClose');
const editModalCancel = document.getElementById('editModalCancel');
const editTodoForm = document.getElementById('editTodoForm');
const editTitle = document.getElementById('editTitle');
const editStatus = document.getElementById('editStatus');
const editAssignedTo = document.getElementById('editAssignedTo');
const editAssignedAvatar = document.getElementById('editAssignedAvatar');
const editDeadline = document.getElementById('editDeadline');
const editPriority = document.getElementById('editPriority');
let editingTodoId = null;

document.addEventListener('click', function(event) {
  const editBtn = event.target.closest('.actions .edit');
  if (editBtn) {
    const row = editBtn.closest('tr');
    editingTodoId = editBtn.dataset.id;

    // Title
    let titleText = '';
    const titleTd = row.cells[1];
    for (const node of titleTd.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) titleText += node.textContent.trim();
    }
    editTitle.value = titleText;

    // Status
    const statusSpan = row.cells[2].querySelector('span.status-label');
    let statusClass = 'not-started';
    if (statusSpan) {
      const classes = Array.from(statusSpan.classList);
      statusClass = classes.find(c => c !== 'status-label') || statusSpan.textContent.toLowerCase().replace(/\s+/g, '-');
    }
    editStatus.value = statusClass;

    // Assigned To
    let assignedText = '';
    const assignedTd = row.cells[3];
    for (const node of assignedTd.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) assignedText += node.textContent.trim();
    }
    editAssignedTo.value = assignedText;

    // Assigned Avatar Src
    const avatarAssigned = assignedTd.querySelector('img');
    editAssignedAvatar.value = avatarAssigned ? avatarAssigned.src : '';

    // Deadline
    editDeadline.value = row.cells[4].textContent.trim();

    // Priority
    const prioritySpan = row.cells[5].querySelector('span.priority-label');
    let priorityClass = 'medium';
    if (prioritySpan) {
      const pClasses = Array.from(prioritySpan.classList);
      priorityClass = pClasses.find(c => ['high','medium','low'].includes(c)) || 'medium';
    }
    editPriority.value = priorityClass;

    editModal.style.display = 'block';
  }

  // --- Delete functionality (fixed await here) ---
  const deleteBtn = event.target.closest('.actions .delete');
  if (deleteBtn) {
    (async () => {
      const todoId = deleteBtn.dataset.id;
      if (confirm('Delete this task?')) {
        try {
          const { error } = await supabase.from('todos').delete().eq('id', todoId);
          if (error) alert('Delete failed: ' + error.message);
          else loadTodos();
        } catch (err) {
          alert('Error deleting: ' + err.message);
        }
      }
    })();
  }
});

function closeEditModal() {
  editingTodoId = null;
  editModal.style.display = 'none';
}
editModalClose?.addEventListener('click', closeEditModal);
editModalCancel?.addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => { if (event.target === editModal) closeEditModal(); });

editTodoForm.addEventListener('submit', async function(event){
  event.preventDefault();
  if(!editingTodoId) return;

  const { error } = await supabase.from('todos').update({
    title: editTitle.value,
    status: editStatus.value,
    assigned_to: editAssignedTo.value,
    assigned_avatar: editAssignedAvatar.value,
    deadline: editDeadline.value,
    priority: editPriority.value
  }).eq('id', editingTodoId);

  if (error) alert('Edit failed! ' + error.message);
  else {
    closeEditModal();
    loadTodos();
  }
});

// ========== Todo List Select All ==========
const selectAllCheckbox = document.getElementById('selectAll');
if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('#todoTable tbody input[type="checkbox"]');
    checkboxes.forEach(cb => { cb.checked = selectAllCheckbox.checked; });
  });
}

// ========== CONTACTS ==========
async function loadContacts() {
  const grid = document.querySelector('.contacts-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="color:#888;text-align:center;">Loading...</div>';
  const { data: contacts, error } = await supabase.from('contacts').select('*').order('id', { ascending: true });
  if (error) {
    grid.innerHTML = `<div style="color:red;">Error fetching contacts</div>`;
    return;
  }
  if (!contacts || contacts.length === 0) {
    grid.innerHTML = `<div style="color:#888;">No contacts yet.</div>`;
    return;
  }
  grid.innerHTML = '';
  contacts.forEach(contact => {
    grid.innerHTML += `
      <div class="contact-card">
        <div class="contact-avatar">
          <img src="${contact.avatar}" alt="${contact.name}" />
        </div>
        <div class="contact-info">
          <div class="contact-name">${contact.name}</div>
          <div class="contact-email">${contact.email}</div>
          <span class="contact-badge ${contact.type && contact.type.toLowerCase()}">${capitalize(contact.type || '')}</span>
        </div>
      </div>
    `;
  });
}

// ========== ADD CONTACT MODAL & LOGIC ==========
const addContactBtn = document.querySelector('.add-contact-btn');
const addContactModal = document.getElementById('addContactModal');
const addContactModalClose = document.getElementById('addContactModalClose');
const addContactModalCancel = document.getElementById('addContactModalCancel');
const addContactForm = document.getElementById('addContactForm');

if (addContactBtn) {
  addContactBtn.addEventListener('click', () => {
    addContactModal.style.display = 'block';
    addContactForm.reset();
  });
}

const closeAddContactModal = () => {
  addContactModal.style.display = 'none';
};

addContactModalClose?.addEventListener('click', closeAddContactModal);
addContactModalCancel?.addEventListener('click', closeAddContactModal);
window.addEventListener('click', (event) => {
  if (event.target === addContactModal) closeAddContactModal();
});

addContactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const avatar = document.getElementById('contactAvatar').value.trim();
  const type = document.getElementById('contactType').value;

  if (!name || !email || !avatar || !type) {
    alert('Please fill in all fields.');
    return;
  }

  const { error } = await supabase.from('contacts').insert([{ name, email, avatar, type }]);

  if (error) alert('Failed to add contact: ' + error.message);
  else {
    closeAddContactModal();
    loadContacts();
  }
});
