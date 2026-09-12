from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm
from .models import StudentProfile


class StudentRegistrationForm(forms.ModelForm):
    first_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'e.g. Alex', 'class': 'form-input'})
    )
    last_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'e.g. Morgan', 'class': 'form-input'})
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'placeholder': 'alex.morgan@university.edu', 'class': 'form-input'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Choose a strong password', 'class': 'form-input'}),
        min_length=6
    )
    password_confirm = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Repeat your password', 'class': 'form-input'}),
        label='Confirm Password'
    )
    institution = forms.CharField(
        max_length=150,
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'e.g. Stanford University', 'class': 'form-input'})
    )
    grade_or_major = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'e.g. Computer Science BS', 'class': 'form-input'}),
        label='Major / Department'
    )

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']
        widgets = {
            'username': forms.TextInput(attrs={'placeholder': 'Choose a username', 'class': 'form-input'}),
        }

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError('A student with that username already exists.')
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError('A student with that email already exists.')
        return email

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('password')
        p2 = cleaned_data.get('password_confirm')
        if p1 and p2 and p1 != p2:
            self.add_error('password_confirm', 'Passwords do not match.')
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
            profile = user.student_profile
            profile.institution = self.cleaned_data.get('institution') or 'University Student'
            profile.grade_or_major = self.cleaned_data.get('grade_or_major') or 'General Studies'
            profile.save()
        return user


class StudentLoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'placeholder': 'Enter your username', 'class': 'form-input', 'autocomplete': 'username'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Enter your password', 'class': 'form-input', 'autocomplete': 'current-password'})
    )


class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-input'}),
            'last_name': forms.TextInput(attrs={'class': 'form-input'}),
            'email': forms.EmailInput(attrs={'class': 'form-input'}),
        }


class StudentProfileUpdateForm(forms.ModelForm):
    COLOR_CHOICES = [
        ('#4f46e5', 'Indigo Purple'),
        ('#2563eb', 'Ocean Blue'),
        ('#059669', 'Emerald Green'),
        ('#d97706', 'Amber Gold'),
        ('#dc2626', 'Crimson Red'),
        ('#7c3aed', 'Violet Glow'),
        ('#0891b2', 'Cyan Breeze'),
        ('#db2777', 'Rose Pink'),
    ]

    avatar_color = forms.ChoiceField(
        choices=COLOR_CHOICES,
        widget=forms.Select(attrs={'class': 'form-input form-select'})
    )

    class Meta:
        model = StudentProfile
        fields = ['institution', 'grade_or_major', 'semester_or_year', 'daily_study_goal_hours', 'avatar_color', 'bio']
        widgets = {
            'institution': forms.TextInput(attrs={'class': 'form-input'}),
            'grade_or_major': forms.TextInput(attrs={'class': 'form-input'}),
            'semester_or_year': forms.TextInput(attrs={'class': 'form-input'}),
            'daily_study_goal_hours': forms.NumberInput(attrs={'class': 'form-input', 'step': '0.5', 'min': '0.5', 'max': '24'}),
            'bio': forms.Textarea(attrs={'class': 'form-input', 'rows': 3}),
        }
