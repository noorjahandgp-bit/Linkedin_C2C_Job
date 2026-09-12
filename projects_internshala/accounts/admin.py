from django.contrib import admin
from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution', 'grade_or_major', 'semester_or_year', 'daily_study_goal_hours', 'created_at')
    search_fields = ('user__username', 'user__email', 'institution', 'grade_or_major')
    list_filter = ('institution', 'created_at')
