from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    institution = models.CharField(max_length=150, default='National University', blank=True)
    grade_or_major = models.CharField(max_length=100, default='Computer Science & Engineering', blank=True)
    semester_or_year = models.CharField(max_length=50, default='Semester 4', blank=True)
    daily_study_goal_hours = models.FloatField(default=4.0)
    avatar_color = models.CharField(max_length=20, default='#4f46e5')
    bio = models.TextField(blank=True, default='Passionate student striving to stay organized and achieve academic goals.')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def initials(self):
        first = self.user.first_name[:1] if self.user.first_name else self.user.username[:1]
        last = self.user.last_name[:1] if self.user.last_name else ''
        return (first + last).upper() or 'ST'


@receiver(post_save, sender=User)
def create_or_save_user_profile(sender, instance, created, **kwargs):
    if created:
        StudentProfile.objects.create(user=instance)
    else:
        if hasattr(instance, 'student_profile'):
            instance.student_profile.save()
