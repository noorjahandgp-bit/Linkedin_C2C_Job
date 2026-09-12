/**
 * STUDENT TASK & TO-DO MANAGER - TASK INTERACTIONS SCRIPT
 * Handles AJAX completion toggling, subtask management, and client-side filtering.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTaskToggles();
  initSubtaskToggles();
  initClientFilter();
});

/**
 * Handle AJAX toggling of Task completion
 */
function initTaskToggles() {
  const taskCheckboxes = document.querySelectorAll('.ajax-task-toggle');

  taskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const taskId = checkbox.getAttribute('data-task-id');
      const toggleUrl = `/tasks/${taskId}/toggle/?format=json`;
      const taskCard = checkbox.closest('.task-card') || checkbox.closest('.dashboard-task-row');
      const csrfToken = getCookie('csrftoken');

      try {
        const response = await fetch(toggleUrl, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.success) {
          // Update visual state of task card
          if (taskCard) {
            if (data.is_completed) {
              taskCard.classList.add('is-completed');
            } else {
              taskCard.classList.remove('is-completed');
            }
          }

          // Update status badge if on task detail or list
          const statusBadge = document.getElementById(`statusBadge_${taskId}`);
          if (statusBadge) {
            if (data.is_completed) {
              statusBadge.className = 'badge badge-status badge-status-completed';
              statusBadge.textContent = 'Completed';
            } else {
              statusBadge.className = 'badge badge-status badge-status-todo';
              statusBadge.textContent = 'To Do';
            }
          }

          // Update header / dashboard counters dynamically if present
          const completedCountEl = document.getElementById('statCompletedCount');
          const pendingCountEl = document.getElementById('statPendingCount');
          const completionRateEl = document.getElementById('statCompletionRate');
          const progressBarEl = document.getElementById('statProgressBar');

          if (completedCountEl) completedCountEl.textContent = data.completed_count;
          if (pendingCountEl) pendingCountEl.textContent = data.pending_count;
          if (completionRateEl) completionRateEl.textContent = `${data.completion_rate}%`;
          if (progressBarEl) progressBarEl.style.width = `${data.completion_rate}%`;

          // Toast message
          const msg = data.is_completed ? `Completed: "${data.title}"` : `Marked pending: "${data.title}"`;
          showToast(msg, data.is_completed ? 'success' : 'info');
        }
      } catch (err) {
        console.error('Error toggling task:', err);
        // Revert checkbox state on error
        checkbox.checked = !checkbox.checked;
        showToast('Failed to update task status. Please check connection.', 'error');
      }
    });
  });
}

/**
 * Handle Subtask AJAX Toggle in Task Detail view
 */
function initSubtaskToggles() {
  const subtaskCheckboxes = document.querySelectorAll('.ajax-subtask-toggle');

  subtaskCheckboxes.forEach(cb => {
    cb.addEventListener('change', async () => {
      const subtaskId = cb.getAttribute('data-subtask-id');
      const toggleUrl = `/subtasks/${subtaskId}/toggle/`;
      const subtaskItem = cb.closest('.subtask-item');
      const csrfToken = getCookie('csrftoken');

      try {
        const response = await fetch(toggleUrl, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken,
          }
        });

        const data = await response.json();

        if (data.success) {
          if (subtaskItem) {
            if (data.is_completed) {
              subtaskItem.classList.add('is-done');
            } else {
              subtaskItem.classList.remove('is-done');
            }
          }

          // Update subtask progress bar in task detail
          const subtaskProgressText = document.getElementById('subtaskProgressText');
          const subtaskProgressBar = document.getElementById('subtaskProgressBar');

          if (data.progress) {
            if (subtaskProgressText) {
              subtaskProgressText.textContent = `${data.progress.completed} of ${data.progress.total} completed (${data.progress.percentage}%)`;
            }
            if (subtaskProgressBar) {
              subtaskProgressBar.style.width = `${data.progress.percentage}%`;
            }
          }

          showToast('Checklist updated', 'success');
        }
      } catch (err) {
        console.error('Error toggling subtask:', err);
        cb.checked = !cb.checked;
        showToast('Could not update checklist item.', 'error');
      }
    });
  });
}

/**
 * Client-side fast search filter
 */
function initClientFilter() {
  const clientSearchInput = document.getElementById('clientSearchInput');
  if (!clientSearchInput) return;

  clientSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const taskCards = document.querySelectorAll('.task-card');

    let visibleCount = 0;
    taskCards.forEach(card => {
      const title = card.querySelector('.task-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.task-description')?.textContent.toLowerCase() || '';
      const course = card.querySelector('.badge-course')?.textContent.toLowerCase() || '';

      if (title.includes(query) || desc.includes(query) || course.includes(query)) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResultsMsg = document.getElementById('clientNoResults');
    if (noResultsMsg) {
      noResultsMsg.style.display = (visibleCount === 0 && query !== '') ? 'flex' : 'none';
    }
  });
}
