from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from tasks.models import Course, Task, SubTask
from accounts.models import StudentProfile


class Command(BaseCommand):
    help = 'Seeds demo student account, courses, tasks, and subtasks for quick demonstration'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Initializing seed process...'))

        # Create or retrieve demo student user
        username = 'student'
        email = 'student@campus.edu'
        password = 'password123'

        user, created = User.objects.get_or_create(username=username, defaults={
            'email': email,
            'first_name': 'Alex',
            'last_name': 'Rivera',
        })

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {username}'))
        else:
            self.stdout.write(self.style.WARNING(f'User {username} already exists. Updating data...'))

        # Update profile
        profile = user.student_profile
        profile.institution = 'Stanford University'
        profile.grade_or_major = 'Computer Science & Engineering (B.S.)'
        profile.semester_or_year = 'Junior Year - Semester 5'
        profile.daily_study_goal_hours = 5.0
        profile.avatar_color = '#4f46e5'
        profile.bio = 'Junior undergraduate student passionate about algorithms, distributed systems, and modern web applications.'
        profile.save()

        # Clear existing tasks and courses for fresh seeding
        user.tasks.all().delete()
        user.courses.all().delete()

        # Create Courses
        courses_data = [
            {
                'code': 'CS201',
                'name': 'Data Structures & Algorithms',
                'instructor': 'Prof. Donald Knuth',
                'color': '#3b82f6'
            },
            {
                'code': 'MATH215',
                'name': 'Linear Algebra & Calculus',
                'instructor': 'Dr. Katherine Johnson',
                'color': '#8b5cf6'
            },
            {
                'code': 'CS340',
                'name': 'Web Application Engineering',
                'instructor': 'Prof. Tim Berners-Lee',
                'color': '#10b981'
            },
            {
                'code': 'PHYS102',
                'name': 'Physics: Fields & Electromagnetism',
                'instructor': 'Dr. Richard Feynman',
                'color': '#f59e0b'
            }
        ]

        course_map = {}
        for cdata in courses_data:
            course = Course.objects.create(
                user=user,
                code=cdata['code'],
                name=cdata['name'],
                instructor=cdata['instructor'],
                color=cdata['color']
            )
            course_map[cdata['code']] = course
            self.stdout.write(self.style.SUCCESS(f'Created course: {course.code}'))

        now = timezone.now()

        # Tasks to create
        tasks_data = [
            {
                'course': course_map['CS201'],
                'title': 'Implement Red-Black Tree Self-Balancing Insertion',
                'description': 'Implement insertion fixup cases (1, 2, and 3) with rotation helpers. Include comprehensive unit tests and benchmark against standard BST.',
                'task_type': 'assignment',
                'priority': 'urgent',
                'status': 'in_progress',
                'is_completed': False,
                'due_date': now + timedelta(days=2, hours=4),
                'estimated_minutes': 180,
                'subtasks': [
                    ('Define Red-Black Tree Node struct and color enum', True),
                    ('Implement Left-Rotate and Right-Rotate operations', True),
                    ('Implement RB-Insert-Fixup for recoloring & rotations', False),
                    ('Write 15 edge case unit tests', False)
                ]
            },
            {
                'course': course_map['MATH215'],
                'title': 'Problem Set 6: Eigenvalues and Diagonalization',
                'description': 'Solve problems 1-8 from Strang Chapter 6. Compute characteristic polynomials, verify algebraic vs geometric multiplicity.',
                'task_type': 'assignment',
                'priority': 'high',
                'status': 'todo',
                'is_completed': False,
                'due_date': now + timedelta(days=1, hours=8),
                'estimated_minutes': 120,
                'subtasks': [
                    ('Problems 1 to 3: Eigenvalues of 2x2 and 3x3 matrices', True),
                    ('Problem 4: Finding orthogonal eigenvectors of symmetric matrices', False),
                    ('Problems 5 to 7: Spectral decomposition & matrix powers', False),
                    ('Review proof for Problem 8', False)
                ]
            },
            {
                'course': course_map['CS340'],
                'title': 'Full-Stack Task Manager: Authentication & REST APIs',
                'description': 'Deliver the milestone submission: complete user login, session management, CSRF handling, and dynamic JSON endpoints for tasks.',
                'task_type': 'project',
                'priority': 'medium',
                'status': 'completed',
                'is_completed': True,
                'completed_at': now - timedelta(hours=14),
                'due_date': now - timedelta(days=1),
                'estimated_minutes': 240,
                'subtasks': [
                    ('Create Django accounts app and models', True),
                    ('Implement login/registration templates', True),
                    ('Build AJAX toggle status view', True),
                    ('Write unit tests for authentication views', True)
                ]
            },
            {
                'course': course_map['PHYS102'],
                'title': 'Physics Lab 4: Faraday Induction & Magnetic Flux',
                'description': 'Calculate induced EMF from oscilloscope data plots. Tabulate errors and submit PDF write-up through canvas portal.',
                'task_type': 'lab',
                'priority': 'high',
                'status': 'todo',
                'due_date': now + timedelta(days=4, hours=2),
                'estimated_minutes': 90,
                'subtasks': [
                    ('Process raw voltage data in Python / Excel', False),
                    ('Plot flux vs time curves and fit sinusoidal regression', False),
                    ('Draft error analysis and conclusion section', False)
                ]
            },
            {
                'course': course_map['CS201'],
                'title': 'Midterm Exam Preparation: Sorting & Graph Algorithms',
                'description': 'Review Dijkstra, Bellman-Ford, Prim/Kruskal MST, and amortized complexity of disjoint set union.',
                'task_type': 'exam_prep',
                'priority': 'urgent',
                'status': 'in_progress',
                'due_date': now + timedelta(hours=18),
                'estimated_minutes': 150,
                'subtasks': [
                    ('Cheat sheet: Graph representations (Adj list vs matrix)', True),
                    ('Practice 3 past exam questions on Topological Sort', True),
                    ('Review QuickSort worst-case pivot selection', False)
                ]
            },
            {
                'course': course_map['MATH215'],
                'title': 'Read Chapter 7: Singular Value Decomposition (SVD)',
                'description': 'Study geometric interpretation of SVD, pseudo-inverses, and applications to image compression.',
                'task_type': 'reading',
                'priority': 'low',
                'status': 'todo',
                'due_date': now + timedelta(days=7),
                'estimated_minutes': 60,
                'subtasks': []
            },
            {
                'course': None,
                'title': 'Submit Summer Software Engineering Internship Applications',
                'description': 'Update resume with recent open-source projects, write tailored cover letters for Google and DeepMind positions.',
                'task_type': 'general',
                'priority': 'urgent',
                'status': 'completed',
                'is_completed': True,
                'completed_at': now - timedelta(days=2),
                'due_date': now - timedelta(days=2),
                'estimated_minutes': 90,
                'subtasks': [
                    ('Format LaTeX resume PDF', True),
                    ('Submit portal applications', True)
                ]
            },
            {
                'course': course_map['CS340'],
                'title': 'CSS3 Design System & Responsive Mobile Drawer',
                'description': 'Craft custom CSS variables for light/dark theme switcher, accessible focus states, and smooth CSS transitions.',
                'task_type': 'project',
                'priority': 'medium',
                'status': 'in_progress',
                'due_date': now + timedelta(days=3),
                'estimated_minutes': 120,
                'subtasks': [
                    ('Design light and dark mode palette variables', True),
                    ('Implement responsive flex and grid layouts', True),
                    ('Create accessible modal dialogs in vanilla JS', False)
                ]
            }
        ]

        for tdata in tasks_data:
            subtasks = tdata.pop('subtasks', [])
            task = Task.objects.create(user=user, **tdata)
            for idx, (st_title, st_completed) in enumerate(subtasks):
                SubTask.objects.create(
                    task=task,
                    title=st_title,
                    is_completed=st_completed,
                    order=idx
                )
            self.stdout.write(self.style.SUCCESS(f'Created task: {task.title}'))

        self.stdout.write(self.style.SUCCESS('\nDemo data successfully seeded!'))
        self.stdout.write(self.style.SUCCESS(f'Demo User: {username} | Password: {password}'))
