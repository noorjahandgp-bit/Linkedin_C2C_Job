from django.contrib import admin
from .models import Course, Task, SubTask


class SubTaskInline(admin.TabularInline):
    model = SubTask
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'user', 'instructor', 'color', 'created_at')
    list_filter = ('user',)
    search_fields = ('code', 'name', 'instructor')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'course', 'priority', 'task_type', 'status', 'is_completed', 'due_date')
    list_filter = ('is_completed', 'priority', 'task_type', 'status', 'course')
    search_fields = ('title', 'description')
    inlines = [SubTaskInline]


@admin.register(SubTask)
class SubTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'task', 'is_completed', 'order')
    list_filter = ('is_completed',)
