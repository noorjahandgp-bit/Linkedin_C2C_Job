from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class Course(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, help_text='Course code, e.g. CS101, MATH202')
    instructor = models.CharField(max_length=100, blank=True, default='')
    color = models.CharField(max_length=20, default='#3b82f6')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['code']
        unique_together = ('user', 'code')

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def total_tasks(self):
        return self.tasks.count()

    @property
    def completed_tasks(self):
        return self.tasks.filter(is_completed=True).count()

    @property
    def pending_tasks(self):
        return self.tasks.filter(is_completed=False).count()

    @property
    def progress_percentage(self):
        total = self.total_tasks
        if total == 0:
            return 0
        return round((self.completed_tasks / total) * 100)


class Task(models.Model):
    TASK_TYPE_CHOICES = [
        ('assignment', 'Assignment / Homework'),
        ('exam_prep', 'Exam Preparation'),
        ('project', 'Course Project'),
        ('reading', 'Reading & Research'),
        ('lab', 'Lab Experiment / Code'),
        ('general', 'General Study / Revision'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    task_type = models.CharField(max_length=30, choices=TASK_TYPE_CHOICES, default='assignment')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    is_completed = models.BooleanField(default=False)
    due_date = models.DateTimeField(null=True, blank=True)
    estimated_minutes = models.PositiveIntegerField(default=60, help_text='Estimated study/work time in minutes')
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['is_completed', 'due_date', '-priority']

    def __str__(self):
        return self.title

    def mark_completed(self):
        self.is_completed = True
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

    def mark_pending(self):
        self.is_completed = False
        if self.status == 'completed':
            self.status = 'todo'
        self.completed_at = None
        self.save()

    def toggle_completion(self):
        if self.is_completed:
            self.mark_pending()
        else:
            self.mark_completed()

    @property
    def is_overdue(self):
        if self.due_date and not self.is_completed:
            return timezone.now() > self.due_date
        return False

    @property
    def is_due_soon(self):
        if self.due_date and not self.is_completed:
            now = timezone.now()
            return now <= self.due_date <= (now + timedelta(hours=24))
        return False

    @property
    def subtask_progress(self):
        total = self.subtasks.count()
        if total == 0:
            return {'total': 0, 'completed': 0, 'percentage': 0}
        completed = self.subtasks.filter(is_completed=True).count()
        return {
            'total': total,
            'completed': completed,
            'percentage': round((completed / total) * 100)
        }


class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=250)
    is_completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.task.title} - {self.title}"
