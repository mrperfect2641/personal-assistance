// ==================== SUPABASE INITIALIZATION =====================
// Replace these with your actual keys from your Supabase project
const SUPABASE_URL = 'https://teafrrntffzraoiuurie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWZycm50ZmZ6cmFvaXV1cmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTMwMzgsImV4cCI6MjA2OTE2OTAzOH0.EZ7Lkxo_H1lZMMMH9OmjqKm3ALcIRripTzYrz7FosZs';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== SIDEBAR NAVIGATION =========================

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

function hideAllSections() {
  dashboardSection.style.display = 'none';
  financeSection.style.display = 'none';
  todoSection.style.display = 'none';
  notesSection.style.display = 'none';
  contactsSection.style.display = 'none';
}

function clearSidebarActive() {
  sidebarLinks.forEach(link => link.classList.remove('active'));
}

// Event listeners for sidebar navigation
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
  loadFinance();
};
todoLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  todoSection.style.display = 'block';
  clearSidebarActive();
  todoLink.classList.add('active');
  loadTodos();
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
  loadContacts();
};

// Initialize first view
window.onload = function() {
  hideAllSections();
  dashboardSection.style.display = 'block';
  clearSidebarActive();
  dashboardLink.classList.add('active');
  // Load initial data for dynamic sections
  loadTodos();
  loadContacts();
  loadFinance();
};

// ==================== HELPER FUNCTIONS ===========================
function formatStatus(str) {
  // Convert e.g., 'in-progress' → 'In Progress'
  return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function formatTxDate(str) {
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0,5);
}
function formatAmount(n) {
  return parseFloat(n).toLocaleString(undefined, {minimumFractionDigits:2});
}

// ==================== TODO LIST FUNCTIONALITY =====================

// Load todos from Supabase and render
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

// Add Task Modal Handling
const addModal = document.getElementById('addModal');
const addModalClose = document.getElementById('addModalClose');
const addModalCancel = document.getElementById('addModalCancel');
const addTodoForm = document.getElementById('addTodoForm');
const addTaskBtn = document.querySelector('.add-task-btn');

if (addTaskBtn) {
  addTaskBtn.addEventListener('click', () => {
    addModal.style.display = 'block';
    addTodoForm.reset();
  });
}
function closeAddModal() { addModal.style.display = 'none'; }
addModalClose?.addEventListener('click', closeAddModal);
addModalCancel?.addEventListener('click', closeAddModal);
window.addEventListener('click', (event) => {
  if (event.target === addModal) closeAddModal();
});

addTodoForm.addEventListener('submit', async (event) => {
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

// Edit Task Modal Handling
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

document.addEventListener('click', async function(event) {
  const editBtn = event.target.closest('.actions .edit');
  if (editBtn) {
    const row = editBtn.closest('tr');
    editingTodoId = editBtn.dataset.id;

    // Populate fields
    let titleText = '';
    const titleTd = row.cells[1];
    for (const node of titleTd.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) titleText += node.textContent.trim();
    }
    editTitle.value = titleText;

    const statusSpan = row.cells[2].querySelector('span.status-label');
    let statusClass = 'not-started';
    if(statusSpan){
      const classes = Array.from(statusSpan.classList);
      statusClass = classes.find(c => c !== 'status-label') || statusSpan.textContent.toLowerCase().replace(/\s+/g, '-');
    }
    editStatus.value = statusClass;

    let assignedText = '';
    const assignedTd = row.cells[3];
    for (const node of assignedTd.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) assignedText += node.textContent.trim();
    }
    editAssignedTo.value = assignedText;

    const avatarAssigned = assignedTd.querySelector('img');
    editAssignedAvatar.value = avatarAssigned ? avatarAssigned.src : '';

    editDeadline.value = row.cells[4].textContent.trim();

    const prioritySpan = row.cells[5].querySelector('span.priority-label');
    let priorityClass = 'medium';
    if (prioritySpan) {
      const pClasses = Array.from(prioritySpan.classList);
      priorityClass = pClasses.find(c => ['high','medium','low'].includes(c)) || 'medium';
    }
    editPriority.value = priorityClass;

    editModal.style.display = 'block';
  }

  // Delete Task Handling
  const deleteBtn = event.target.closest('.actions .delete');
  if (deleteBtn) {
    const todoId = deleteBtn.dataset.id;
    if(confirm('Delete this task?')){
      try {
        const { error } = await supabase.from('todos').delete().eq('id', todoId);
        if(error) {
          alert('Delete failed: ' + error.message);
        } else {
          loadTodos();
        }
      } catch(err) {
        alert('Error deleting: ' + err.message);
      }
    }
  }
});

function closeEditModal() {
  editingTodoId = null;
  editModal.style.display = 'none';
}
editModalClose?.addEventListener('click', closeEditModal);
editModalCancel?.addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => {
  if (event.target === editModal) closeEditModal();
});

editTodoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!editingTodoId) return;
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

// Todo List Select All
const selectAllCheckbox = document.getElementById('selectAll');
if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('#todoTable tbody input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
  });
}

// ==================== CONTACTS ==========================

async function loadContacts() {
  const grid = document.querySelector('.contacts-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="color:#888;text-align:center;">Loading...</div>';
  const { data: contacts, error } = await supabase.from('contacts').select('*').order('id', { ascending: true });
  if (error) {
    grid.innerHTML = '<div style="color:red;">Error fetching contacts</div>';
    return;
  }
  if (!contacts || contacts.length === 0) {
    grid.innerHTML = '<div style="color:#888;">No contacts yet.</div>';
    return;
  }
  grid.innerHTML = '';
  contacts.forEach(contact => {
    grid.innerHTML += `
      <div class="contact-card">
        <div class="contact-avatar"><img src="${contact.avatar}" alt="${contact.name}" /></div>
        <div class="contact-info">
          <div class="contact-name">${contact.name}</div>
          <div class="contact-email">${contact.email}</div>
          <span class="contact-badge ${contact.type && contact.type.toLowerCase()}">${capitalize(contact.type || '')}</span>
        </div>
      </div>
    `;
  });
}

// Add Contact Modal & Logic
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

// ==================== FINANCE =============================

// Expense category colors for chart
const EXPENSE_PALETTE = [
  "#5A8DEE", "#eb4359", "#02cfcf", "#ff9800", "#6658e3", "#00CF92", "#fbdb47"
];

let expenseChart = null;

function renderExpenseChart(labels, data) {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (expenseChart) expenseChart.destroy();
  if (labels.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    document.getElementById('expenseLegend').innerHTML = '';
    return;
  }
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: labels.map((_, i) => EXPENSE_PALETTE[i % EXPENSE_PALETTE.length]),
        borderWidth: 1.5
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      cutout: '65%',
      responsive: false
    }
  });

  // Custom legend
  document.getElementById('expenseLegend').innerHTML = labels.map((c, i) =>
    `<span class="legend-item"><span class="legend-dot" style="background:${EXPENSE_PALETTE[i % EXPENSE_PALETTE.length]}"></span>${c}</span>`
  ).join('');
}

function formatFinanceDate(str) {
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0, 5);
}

async function loadFinance() {
  const tbody = document.querySelector('#transactionsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">Loading...</td></tr>';
  const { data: txs, error } = await supabase.from('transactions').select('*').order('date', { descending: true });

  if (error || !txs) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;">Unable to fetch transactions</td></tr>`;
    renderExpenseChart([], []);
    return;
  }

  if (txs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:#888;">No transactions yet.</td></tr>`;
    renderExpenseChart([], []);
    return;
  }

  tbody.innerHTML = '';
  txs.forEach(tx => {
    const tr = document.createElement('tr');
    tr.dataset.id = tx.id;
    tr.innerHTML = `
      <td>${formatFinanceDate(tx.date)}</td>
      <td>${tx.description}</td>
      <td>${tx.category}</td>
      <td>${capitalize(tx.type)}</td>
      <td style="color:${tx.type === 'expense' ? '#e04141' : '#19b890'}; font-weight: 600;">
        ${tx.type === 'expense' ? '-' : '+'}${formatAmount(tx.amount)}
      </td>
      <td class="actions">
        <button class="edit" title="Edit">&#9998;</button>
        <button class="delete" title="Delete">&#10005;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Aggregate expenses by category for chart
  const catMap = {};
  txs.filter(t => t.type === 'expense').forEach(tx => {
    catMap[tx.category] = (catMap[tx.category] || 0) + Number(tx.amount);
  });
  const cats = Object.keys(catMap);
  const vals = cats.map(c => catMap[c]);
  renderExpenseChart(cats, vals);
}

// Add Transaction Modal Logic
const addTransactionBtn = document.querySelector('.add-transaction-btn');
const addTransactionModal = document.getElementById('addTransactionModal');
const addTransactionModalClose = document.getElementById('addTransactionModalClose');
const addTransactionModalCancel = document.getElementById('addTransactionModalCancel');
const addTransactionForm = document.getElementById('addTransactionForm');

if (addTransactionBtn) {
  addTransactionBtn.addEventListener('click', () => {
    addTransactionModal.style.display = 'block';
    addTransactionForm.reset();
  });
}
function closeAddTransactionModal() { addTransactionModal.style.display = 'none'; }
addTransactionModalClose?.addEventListener('click', closeAddTransactionModal);
addTransactionModalCancel?.addEventListener('click', closeAddTransactionModal);
window.addEventListener('click', (event) => {
  if (event.target === addTransactionModal) closeAddTransactionModal();
});

addTransactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const amount = parseFloat(document.getElementById('transactionAmount').value);
  const description = document.getElementById('transactionDescription').value.trim();
  const category = document.getElementById('transactionCategory').value;
  const type = document.getElementById('transactionType').value;
  if (!amount || !description || !category || !type) {
    alert('Please fill in all fields.');
    return;
  }
  const { error } = await supabase.from('transactions').insert([
    {
      amount, description, category, type, date: new Date().toISOString()
    }
  ]);
  if (error) alert('Failed to add transaction: ' + error.message);
  else {
    closeAddTransactionModal();
    loadFinance();
  }
});

// Edit Transaction Modal Logic
const editTransactionModal = document.getElementById('editTransactionModal');
const editTransactionModalClose = document.getElementById('editTransactionModalClose');
const editTransactionModalCancel = document.getElementById('editTransactionModalCancel');
const editTransactionForm = document.getElementById('editTransactionForm');

let editingTransactionId = null;

function openEditTransactionModal(row) {
  if (!row) return;
  editingTransactionId = row.dataset.id;

  const tds = row.querySelectorAll('td');
  document.getElementById('editTransactionAmount').value = parseFloat(tds[4].textContent.replace(/[^\d.-]/g, ''));
  document.getElementById('editTransactionDescription').value = tds[1].textContent;
  document.getElementById('editTransactionCategory').value = tds[2].textContent;
  document.getElementById('editTransactionType').value = tds[3].textContent.toLowerCase();

  editTransactionModal.style.display = 'block';
}

function closeEditTransactionModal() { editTransactionModal.style.display = 'none'; editingTransactionId = null; }
editTransactionModalClose?.addEventListener('click', closeEditTransactionModal);
editTransactionModalCancel?.addEventListener('click', closeEditTransactionModal);
window.addEventListener('click', (event) => {
  if (event.target === editTransactionModal) closeEditTransactionModal();
});

editTransactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!editingTransactionId) return;

  const amount = parseFloat(document.getElementById('editTransactionAmount').value);
  const description = document.getElementById('editTransactionDescription').value.trim();
  const category = document.getElementById('editTransactionCategory').value;
  const type = document.getElementById('editTransactionType').value;

  if (!amount || !description || !category || !type) {
    alert('Please fill in all fields.');
    return;
  }
  const { error } = await supabase.from('transactions').update({
    amount, description, category, type
  }).eq('id', editingTransactionId);
  if (error) alert('Failed to save changes: ' + error.message);
  else {
    closeEditTransactionModal();
    loadFinance();
  }
});

// Transaction Delete Handler
document.addEventListener('click', async (event) => {
  if (event.target.closest('.transactions-table .delete')) {
    const row = event.target.closest('tr');
    const id = row.dataset.id;
    if(confirm('Are you sure you want to delete this transaction?')){
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if(error) alert('Delete failed: ' + error.message);
      else loadFinance();
    }
  }
});

// Transaction Edit Button Handler
document.addEventListener('click', (event) => {
  if (event.target.closest('.transactions-table .edit')) {
    const row = event.target.closest('tr');
    openEditTransactionModal(row);
  }
});
