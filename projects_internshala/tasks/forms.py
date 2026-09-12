from django import forms
from .models import Task, Course, SubTask


class TaskForm(forms.ModelForm):
    due_date = forms.DateTimeField(
        required=False,
        widget=forms.DateTimeInput(
            attrs={'type': 'datetime-local', 'class': 'form-input'},
            format='%Y-%m-%dT%H:%M'
        )
    )

    class Meta:
        model = Task
        fields = ['title', 'course', 'task_type', 'priority', 'status', 'due_date', 'estimated_minutes', 'description']
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'e.g. Complete Calculus Problem Set 4', 'class': 'form-input'}),
            'course': forms.Select(attrs={'class': 'form-input form-select'}),
            'task_type': forms.Select(attrs={'class': 'form-input form-select'}),
            'priority': forms.Select(attrs={'class': 'form-input form-select'}),
            'status': forms.Select(attrs={'class': 'form-input form-select'}),
            'estimated_minutes': forms.NumberInput(attrs={'class': 'form-input', 'min': 5, 'step': 5}),
            'description': forms.Textarea(attrs={'placeholder': 'Add notes, checklist items, links or study instructions...', 'class': 'form-input', 'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user is not None:
            self.fields['course'].queryset = Course.objects.filter(user=user)
        self.fields['course'].empty_label = "-- General (No Course) --"
        if self.instance and self.instance.due_date:
            self.initial['due_date'] = self.instance.due_date.strftime('%Y-%m-%dT%H:%M')


class CourseForm(forms.ModelForm):
    COLOR_CHOICES = [
        ('#3b82f6', 'Blue'),
        ('#10b981', 'Green'),
        ('#8b5cf6', 'Purple'),
        ('#f59e0b', 'Amber'),
        ('#ef4444', 'Red'),
        ('#06b6d4', 'Cyan'),
        ('#ec4899', 'Pink'),
        ('#64748b', 'Slate'),
    ]

    color = forms.ChoiceField(
        choices=COLOR_CHOICES,
        widget=forms.Select(attrs={'class': 'form-input form-select'})
    )

    class Meta:
        model = Course
        fields = ['code', 'name', 'instructor', 'color']
        widgets = {
            'code': forms.TextInput(attrs={'placeholder': 'e.g. CS201', 'class': 'form-input'}),
            'name': forms.TextInput(attrs={'placeholder': 'e.g. Algorithms & Data Structures', 'class': 'form-input'}),
            'instructor': forms.TextInput(attrs={'placeholder': 'e.g. Prof. Margaret Hamilton', 'class': 'form-input'}),
        }


class SubTaskForm(forms.ModelForm):
    class Meta:
        model = SubTask
        fields = ['title']
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Add a subtask or checklist item...', 'class': 'form-input subtask-input'}),
        }
