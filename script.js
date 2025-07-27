// ================================
// Sidebar Navigation and Content Switching
// ================================

// Get sidebar link elements by their IDs
const dashboardLink = document.getElementById('dashboardLink');
const financeLink = document.getElementById('financeLink');
const todoLink = document.getElementById('todoListLink');
const notesLink = document.getElementById('notesLink');

// Get main content sections by their IDs
const dashboardSection = document.getElementById('dashboardSection');
const financeSection = document.getElementById('financeSection');
const todoSection = document.getElementById('todoSection');
const notesSection = document.getElementById('notesSection');

// Get all sidebar links (for clearing active state)
const sidebarLinks = document.querySelectorAll('.sidebar ul li a');

/**
 * Hide all main content sections
 */
function hideAllSections() {
  dashboardSection.style.display = 'none';
  financeSection.style.display = 'none';
  todoSection.style.display = 'none';
  notesSection.style.display = 'none';
}

/**
 * Remove 'active' class from all sidebar links
 */
function clearSidebarActive() {
  sidebarLinks.forEach(link => link.classList.remove('active'));
}

// Event handler to show Dashboard section
dashboardLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  dashboardSection.style.display = 'block';
  clearSidebarActive();
  dashboardLink.classList.add('active');
};

// Event handler to show Finance section
financeLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  financeSection.style.display = 'block';
  clearSidebarActive();
  financeLink.classList.add('active');
};

// Event handler to show Todo List section
todoLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  todoSection.style.display = 'block';
  clearSidebarActive();
  todoLink.classList.add('active');
};

// Event handler to show Notes section
notesLink.onclick = function(e) {
  e.preventDefault();
  hideAllSections();
  notesSection.style.display = 'block';
  clearSidebarActive();
  notesLink.classList.add('active');
};

/**
 * Initialize default visible section and active menu on page load
 */
window.onload = function() {
  hideAllSections();
  dashboardSection.style.display = 'block'; // Show dashboard by default
  clearSidebarActive();
  dashboardLink.classList.add('active');
};

// ================================
// Todo List Specific Functionality
// ================================

/**
 * Delete a todo task row when Delete button is clicked, with a confirmation prompt
 */
document.addEventListener('click', function(event) {
  if (event.target.closest('.actions .delete')) {
    if (confirm('Delete this task?')) {
      event.target.closest('tr').remove();
    }
  }
});

/**
 * Select/Deselect all checkboxes in the Todo List when header "select all" checkbox is changed
 */
const selectAllCheckbox = document.getElementById('selectAll');
if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener('change', function() {
    // Get all todo task checkboxes in tbody (excluding the header checkbox itself)
    const checkboxes = document.querySelectorAll('#todoTable tbody input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = selectAllCheckbox.checked;
    });
  });
}

// ================================
// Edit Modal Handling for Todo List
// ================================

// Get modal and elements
const editModal = document.getElementById('editModal');
const editModalClose = document.getElementById('editModalClose');
const editModalCancel = document.getElementById('editModalCancel');
const editTodoForm = document.getElementById('editTodoForm');

// Form fields for editing
const editTitle = document.getElementById('editTitle');
const editStatus = document.getElementById('editStatus');
const editAssignedTo = document.getElementById('editAssignedTo');
const editDeadline = document.getElementById('editDeadline');
const editPriority = document.getElementById('editPriority');

let editingRow = null; // Current row being edited

/**
 * Open the edit modal and populate form fields with existing row data
 * @param {HTMLTableRowElement} row Row to edit
 */
function openEditModal(row) {
  editingRow = row;

  // Extract title text (excluding avatar img)
  const titleTd = row.cells[1];
  let titleText = '';
  for (const node of titleTd.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      titleText += node.textContent.trim();
    }
  }
  editTitle.value = titleText;

  // Extract status class or fallback to text
  const statusSpan = row.cells[2].querySelector('span.status-label');
  let statusClass = 'not-started';
  if (statusSpan) {
    const classes = Array.from(statusSpan.classList);
    statusClass = classes.find(c => c !== 'status-label') || statusSpan.textContent.toLowerCase().replace(/\s+/g, '-');
  }
  editStatus.value = statusClass;

  // Extract assigned to text (excluding avatar img)
  const assignedTd = row.cells[3];
  let assignedText = '';
  for (const node of assignedTd.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      assignedText += node.textContent.trim();
    }
  }
  editAssignedTo.value = assignedText;

  // Deadline text
  editDeadline.value = row.cells[4].textContent.trim();

  // Extract priority class or fallback
  const prioritySpan = row.cells[5].querySelector('span.priority-label');
  let priorityClass = 'medium';
  if (prioritySpan) {
    const pClasses = Array.from(prioritySpan.classList);
    priorityClass = pClasses.find(c => ['high', 'medium', 'low'].includes(c)) || 'medium';
  }
  editPriority.value = priorityClass;

  // Show modal
  editModal.style.display = 'block';
}

/**
 * Close the edit modal and reset editing state
 */
function closeEditModal() {
  editModal.style.display = 'none';
  editingRow = null;
}

// Delegate click event for Edit buttons to open modal
document.addEventListener('click', function(event) {
  if (event.target.closest('.actions .edit')) {
    const row = event.target.closest('tr');
    if (row) {
      openEditModal(row);
    }
  }
});

// Close modal on clicking "X" or Cancel button
editModalClose.addEventListener('click', closeEditModal);
editModalCancel.addEventListener('click', closeEditModal);

// Close modal when clicking outside modal content
window.addEventListener('click', (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

// Handle form submission for saving edited task data
editTodoForm.addEventListener('submit', function(event) {
  event.preventDefault();
  if (!editingRow) return;

  // Update title cell (index 1)
  const titleTd = editingRow.cells[1];
  const avatarImg = titleTd.querySelector('img');
  titleTd.textContent = ''; // Clear existing text nodes
  if (avatarImg) titleTd.appendChild(avatarImg);
  titleTd.append(' ' + editTitle.value);

  // Update status cell (index 2)
  const statusTd = editingRow.cells[2];
  const spanStatus = statusTd.querySelector('span.status-label');
  if (spanStatus) {
    spanStatus.textContent = editStatus.options[editStatus.selectedIndex].text;
    spanStatus.className = 'status-label ' + editStatus.value;
  }

  // Update assigned to cell (index 3)
  const assignedTd = editingRow.cells[3];
  const avatarAssigned = assignedTd.querySelector('img');
  assignedTd.textContent = '';
  if (avatarAssigned) assignedTd.appendChild(avatarAssigned);
  assignedTd.append(' ' + editAssignedTo.value);

  // Update deadline cell (index 4)
  editingRow.cells[4].textContent = editDeadline.value;

  // Update priority cell (index 5)
  const priorityTd = editingRow.cells[5];
  const spanPriority = priorityTd.querySelector('span.priority-label');
  if (spanPriority) {
    spanPriority.textContent = editPriority.options[editPriority.selectedIndex].text;
    spanPriority.className = 'priority-label ' + editPriority.value;
  }

  // Close modal after saving
  closeEditModal();
});

// ================================
// Add New Task Modal Handling
// ================================

// Get modal and elements related to adding
const addModal = document.getElementById('addModal');
const addModalClose = document.getElementById('addModalClose');
const addModalCancel = document.getElementById('addModalCancel');
const addTodoForm = document.getElementById('addTodoForm');

// "Add Task" button opens the add modal
const addTaskBtn = document.querySelector('.add-task-btn');
if (addTaskBtn) {
  addTaskBtn.addEventListener('click', function () {
    addModal.style.display = 'block';
    addTodoForm.reset();
  });
}

// Close Add Modal helper
function closeAddModal() {
  addModal.style.display = 'none';
}
addModalClose.addEventListener('click', closeAddModal);
addModalCancel.addEventListener('click', closeAddModal);
// Close add modal when clicking outside modal content
window.addEventListener('click', (event) => {
  if (event.target === addModal) {
    closeAddModal();
  }
});

// Handle Add New Task form submission to add new todo row
addTodoForm.addEventListener('submit', function (event) {
  event.preventDefault();

  // Collect form values
  const title = document.getElementById('addTitle').value;
  const statusValue = document.getElementById('addStatus').value;
  const statusText = document.getElementById('addStatus').options[document.getElementById('addStatus').selectedIndex].text;
  const assignedTo = document.getElementById('addAssignedTo').value;
  const assignedAvatar = document.getElementById('addAssignedAvatar').value;
  const deadline = document.getElementById('addDeadline').value;
  const priorityValue = document.getElementById('addPriority').value;
  const priorityText = document.getElementById('addPriority').options[document.getElementById('addPriority').selectedIndex].text;

  // Create new table row
  const tbody = document.querySelector('#todoTable tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="checkbox"></td>
    <td>
      <img class="avatar" src="${assignedAvatar}" alt="${assignedTo}" />
      ${title}
    </td>
    <td><span class="status-label ${statusValue}">${statusText}</span></td>
    <td>
      <img class="avatar" src="${assignedAvatar}" alt="${assignedTo}" />
      ${assignedTo}
    </td>
    <td>${deadline}</td>
    <td><span class="priority-label ${priorityValue}">${priorityText}</span></td>
    <td class="actions">
      <button class="edit" title="Edit">&#9998;</button>
      <button class="delete" title="Delete">&#10005;</button>
    </td>
  `;
  tbody.appendChild(tr);
  closeAddModal();
});
