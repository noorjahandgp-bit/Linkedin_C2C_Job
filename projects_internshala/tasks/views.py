from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib import messages
from django.utils import timezone
from django.db.models import Q, Count, Sum
from datetime import timedelta

from .models import Task, Course, SubTask
from .forms import TaskForm, CourseForm, SubTaskForm


@login_required
def dashboard_view(request):
    user = request.user
    tasks = Task.objects.filter(user=user)
    courses = Course.objects.filter(user=user)

    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    total_tasks = tasks.count()
    completed_tasks = tasks.filter(is_completed=True).count()
    pending_tasks = total_tasks - completed_tasks
    completion_rate = round((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0

    overdue_count = tasks.filter(is_completed=False, due_date__lt=now).count()
    due_today_tasks = tasks.filter(is_completed=False, due_date__range=(today_start, today_end)).order_by('due_date')
    due_today_count = due_today_tasks.count()

    total_estimated_mins = tasks.filter(is_completed=False).aggregate(total=Sum('estimated_minutes'))['total'] or 0
    estimated_hours = round(total_estimated_mins / 60, 1)

    # Priority breakdown
    high_priority_tasks = tasks.filter(is_completed=False, priority__in=['high', 'urgent']).order_by('due_date')[:5]

    # Recent pending tasks
    recent_tasks = tasks.order_by('-created_at')[:6]

    # Courses with stats
    course_data = []
    for c in courses:
        course_data.append({
            'course': c,
            'total': c.total_tasks,
            'completed': c.completed_tasks,
            'progress': c.progress_percentage
        })

    # Quick task form
    quick_form = TaskForm(user=user)

    context = {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'completion_rate': completion_rate,
        'overdue_count': overdue_count,
        'due_today_count': due_today_count,
        'due_today_tasks': due_today_tasks,
        'estimated_hours': estimated_hours,
        'high_priority_tasks': high_priority_tasks,
        'recent_tasks': recent_tasks,
        'course_data': course_data,
        'quick_form': quick_form,
    }
    return render(request, 'tasks/dashboard.html', context)


@login_required
def task_list_view(request):
    user = request.user
    tasks = Task.objects.filter(user=user)
    courses = Course.objects.filter(user=user)

    status_filter = request.GET.get('status', 'all')
    priority_filter = request.GET.get('priority', 'all')
    course_filter = request.GET.get('course', 'all')
    task_type_filter = request.GET.get('task_type', 'all')
    search_query = request.GET.get('q', '').strip()
    sort_by = request.GET.get('sort', 'due_date')
    view_mode = request.GET.get('view', 'grid')

    now = timezone.now()

    # Status filtering
    if status_filter == 'pending':
        tasks = tasks.filter(is_completed=False)
    elif status_filter == 'completed':
        tasks = tasks.filter(is_completed=True)
    elif status_filter == 'overdue':
        tasks = tasks.filter(is_completed=False, due_date__lt=now)

    # Priority filtering
    if priority_filter and priority_filter != 'all':
        tasks = tasks.filter(priority=priority_filter)

    # Course filtering
    if course_filter and course_filter != 'all':
        if course_filter == 'none':
            tasks = tasks.filter(course__isnull=True)
        else:
            tasks = tasks.filter(course_id=course_filter)

    # Task type filtering
    if task_type_filter and task_type_filter != 'all':
        tasks = tasks.filter(task_type=task_type_filter)

    # Search filter
    if search_query:
        tasks = tasks.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(course__name__icontains=search_query) |
            Q(course__code__icontains=search_query)
        )

    # Sorting
    if sort_by == 'title':
        tasks = tasks.order_by('title')
    elif sort_by == 'priority':
        tasks = tasks.order_by('-priority', 'due_date')
    elif sort_by == 'created':
        tasks = tasks.order_by('-created_at')
    elif sort_by == 'due_date':
        # Put null due dates last
        tasks = tasks.order_by('is_completed', models.F('due_date').asc(nulls_last=True))
    else:
        tasks = tasks.order_by('is_completed', 'due_date')

    # Counts for tab counters
    all_count = Task.objects.filter(user=user).count()
    pending_count = Task.objects.filter(user=user, is_completed=False).count()
    completed_count = Task.objects.filter(user=user, is_completed=True).count()
    overdue_count = Task.objects.filter(user=user, is_completed=False, due_date__lt=now).count()

    context = {
        'tasks': tasks,
        'courses': courses,
        'status_filter': status_filter,
        'priority_filter': priority_filter,
        'course_filter': course_filter,
        'task_type_filter': task_type_filter,
        'search_query': search_query,
        'sort_by': sort_by,
        'view_mode': view_mode,
        'all_count': all_count,
        'pending_count': pending_count,
        'completed_count': completed_count,
        'overdue_count': overdue_count,
        'quick_form': TaskForm(user=user),
    }
    return render(request, 'tasks/task_list.html', context)


@login_required
def task_detail_view(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)
    subtasks = task.subtasks.all()
    subtask_form = SubTaskForm()

    if request.method == 'POST' and 'add_subtask' in request.POST:
        subtask_form = SubTaskForm(request.POST)
        if subtask_form.is_valid():
            subtask = subtask_form.save(commit=False)
            subtask.task = task
            subtask.order = subtasks.count() + 1
            subtask.save()
            messages.success(request, 'Subtask added successfully.')
            return redirect('tasks:task_detail', pk=task.pk)

    context = {
        'task': task,
        'subtasks': subtasks,
        'subtask_form': subtask_form,
    }
    return render(request, 'tasks/task_detail.html', context)


@login_required
def task_create_view(request):
    if request.method == 'POST':
        form = TaskForm(request.POST, user=request.user)
        if form.is_valid():
            task = form.save(commit=False)
            task.user = request.user
            if task.status == 'completed':
                task.is_completed = True
                task.completed_at = timezone.now()
            task.save()

            # Check if initial subtasks were passed
            subtasks_raw = request.POST.get('initial_subtasks', '').strip()
            if subtasks_raw:
                for idx, line in enumerate(subtasks_raw.splitlines()):
                    line = line.strip()
                    if line:
                        SubTask.objects.create(task=task, title=line, order=idx)

            messages.success(request, f'Task "{task.title}" has been created!')
            return redirect('tasks:task_detail', pk=task.pk)
        else:
            messages.error(request, 'Please correct the errors in the task form.')
    else:
        form = TaskForm(user=request.user)

    return render(request, 'tasks/task_form.html', {'form': form, 'action': 'Create'})


@login_required
def task_update_view(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)

    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task, user=request.user)
        if form.is_valid():
            updated_task = form.save(commit=False)
            if updated_task.status == 'completed' and not updated_task.is_completed:
                updated_task.is_completed = True
                updated_task.completed_at = timezone.now()
            elif updated_task.status != 'completed' and updated_task.is_completed:
                updated_task.is_completed = False
                updated_task.completed_at = None
            updated_task.save()
            messages.success(request, f'Task "{task.title}" updated successfully!')
            return redirect('tasks:task_detail', pk=task.pk)
        else:
            messages.error(request, 'Please resolve form errors.')
    else:
        form = TaskForm(instance=task, user=request.user)

    return render(request, 'tasks/task_form.html', {'form': form, 'task': task, 'action': 'Edit'})


@login_required
def task_delete_view(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)
    if request.method == 'POST':
        title = task.title
        task.delete()
        messages.success(request, f'Task "{title}" was permanently removed.')
        return redirect('tasks:task_list')

    return render(request, 'tasks/task_confirm_delete.html', {'task': task})


@login_required
def task_toggle_status(request, pk):
    """AJAX and standard toggle view for task completion."""
    task = get_object_or_404(Task, pk=pk, user=request.user)
    task.toggle_completion()

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('format') == 'json':
        user_tasks = Task.objects.filter(user=request.user)
        total = user_tasks.count()
        completed = user_tasks.filter(is_completed=True).count()
        rate = round((completed / total * 100)) if total > 0 else 0

        return JsonResponse({
            'success': True,
            'is_completed': task.is_completed,
            'status': task.status,
            'completed_at': task.completed_at.strftime('%b %d, %Y %I:%M %p') if task.completed_at else None,
            'completed_count': completed,
            'pending_count': total - completed,
            'completion_rate': rate,
            'task_id': task.id,
            'title': task.title,
        })

    messages.success(request, f'Task "{task.title}" updated.')
    next_url = request.META.get('HTTP_REFERER') or 'tasks:task_list'
    return redirect(next_url)


@login_required
def subtask_toggle(request, pk):
    """Toggle a subtask status."""
    subtask = get_object_or_404(SubTask, pk=pk, task__user=request.user)
    subtask.is_completed = not subtask.is_completed
    subtask.save()

    progress = subtask.task.subtask_progress

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'is_completed': subtask.is_completed,
            'subtask_id': subtask.id,
            'progress': progress
        })

    return redirect('tasks:task_detail', pk=subtask.task.pk)


@login_required
def subtask_delete(request, pk):
    subtask = get_object_or_404(SubTask, pk=pk, task__user=request.user)
    task_pk = subtask.task.pk
    subtask.delete()
    messages.success(request, 'Subtask removed.')
    return redirect('tasks:task_detail', pk=task_pk)


@login_required
def courses_view(request):
    courses = Course.objects.filter(user=request.user)

    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save(commit=False)
            course.user = request.user
            course.save()
            messages.success(request, f'Course "{course.code} - {course.name}" created!')
            return redirect('tasks:courses')
        else:
            messages.error(request, 'Could not create course. Please check if the course code already exists.')
    else:
        form = CourseForm()

    context = {
        'courses': courses,
        'form': form,
    }
    return render(request, 'tasks/courses.html', context)


@login_required
def course_delete_view(request, pk):
    course = get_object_or_404(Course, pk=pk, user=request.user)
    if request.method == 'POST':
        name = f"{course.code} - {course.name}"
        course.delete()
        messages.success(request, f'Course "{name}" removed.')
    return redirect('tasks:courses')
