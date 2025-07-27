// Sidebar toggling logic
const dashboardLink = document.getElementById('dashboardLink');
const todoLink = document.getElementById('todoListLink');
const dashboardSection = document.getElementById('dashboardSection');
const todoSection = document.getElementById('todoSection');
const sidebarLinks = document.querySelectorAll('.sidebar ul li a');

// Remove 'active' class from all links
function clearSidebarActive() {
  sidebarLinks.forEach(link => link.classList.remove('active'));
}

// Show Dashboard
dashboardLink.onclick = function(e) {
  e.preventDefault();
  dashboardSection.style.display = 'block';
  todoSection.style.display = 'none';
  clearSidebarActive();
  dashboardLink.classList.add('active');
};

// Show Todo List
todoLink.onclick = function(e) {
  e.preventDefault();
  dashboardSection.style.display = 'none';
  todoSection.style.display = 'block';
  clearSidebarActive();
  todoLink.classList.add('active');
};

// Set default section
window.onload = function() {
  dashboardSection.style.display = 'block';
  todoSection.style.display = 'none';
  clearSidebarActive();
  dashboardLink.classList.add('active');
}

// Handle Todo Delete
function handleTodoDelete(e) {
  if (e.target.classList.contains('delete')) {
    if (confirm('Delete this task?')) {
      e.target.closest('tr').remove();
    }
  }
}
// Delegate delete button click
document.addEventListener('click', function(e){
  if (e.target.closest('.actions .delete')) {
    handleTodoDelete(e);
  }
});
