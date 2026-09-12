from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import StudentRegistrationForm, StudentLoginForm, UserUpdateForm, StudentProfileUpdateForm
from tasks.models import Task, Course


def register_view(request):
    if request.user.is_authenticated:
        return redirect('tasks:dashboard')

    if request.method == 'POST':
        form = StudentRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to Student Task & To-Do Manager, {user.first_name or user.username}! Let's organize your academic journey.")
            return redirect('tasks:dashboard')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = StudentRegistrationForm()

    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('tasks:dashboard')

    if request.method == 'POST':
        form = StudentLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {user.first_name or user.username}!")
                next_url = request.GET.get('next') or request.POST.get('next')
                return redirect(next_url or 'tasks:dashboard')
        messages.error(request, 'Invalid username or password. Please try again.')
    else:
        form = StudentLoginForm()

    return render(request, 'accounts/login.html', {'form': form})


@login_required
def logout_view(request):
    logout(request)
    messages.info(request, 'You have been securely signed out. See you next study session!')
    return redirect('accounts:login')


@login_required
def profile_view(request):
    profile = request.user.student_profile

    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = StudentProfileUpdateForm(request.POST, instance=profile)

        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, 'Your student profile has been successfully updated!')
            return redirect('accounts:profile')
        else:
            messages.error(request, 'Please fix the errors indicated below.')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = StudentProfileUpdateForm(instance=profile)

    # Calculate student statistics
    total_tasks = Task.objects.filter(user=request.user).count()
    completed_tasks = Task.objects.filter(user=request.user, is_completed=True).count()
    pending_tasks = total_tasks - completed_tasks
    completion_rate = round((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
    total_courses = Course.objects.filter(user=request.user).count()

    context = {
        'u_form': u_form,
        'p_form': p_form,
        'profile': profile,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'completion_rate': completion_rate,
        'total_courses': total_courses,
    }
    return render(request, 'accounts/profile.html', context)
