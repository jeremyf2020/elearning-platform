from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from users.models import StudentProfile, TeacherProfile
from datetime import date

User = get_user_model()

class UserModelTests(TestCase):

    def test_student_profile_auto_creation(self):
        """
        Scenario: Create a user with is_student=True.
        Expected: A StudentProfile is automatically created, and we can save 
        student specific data like ID, DOB, and check-in time.
        """
        # 1. Create the user
        user = User.objects.create_user(
            username='john_student',
            password='password123',
            is_student=True,
            first_name="John",
            last_name="Doe"
        )

        # 2. Check profile existence
        self.assertTrue(hasattr(user, 'student_profile'))
        self.assertIsInstance(user.student_profile, StudentProfile)
        
        # 3. Check AbstractUser name handling (replaces real_name)
        self.assertEqual(user.get_full_name(), "John Doe")
        
        # 4. Test Student Specific Fields
        profile = user.student_profile
        
        # Set values
        profile.student_id_number = "STU-1001"
        profile.dob = date(2005, 5, 20)
        profile.last_checkin = timezone.now() # Manually setting the check-in
        profile.save()

        # Refresh from DB
        saved_profile = StudentProfile.objects.get(user=user)
        
        self.assertEqual(saved_profile.student_id_number, "STU-1001")
        self.assertEqual(saved_profile.dob, date(2005, 5, 20))
        self.assertIsNotNone(saved_profile.last_checkin)

    def test_teacher_profile_auto_creation(self):
        """
        Scenario: Create a user with is_teacher=True.
        Expected: A TeacherProfile is created. We test 'bio' specifically.
        """
        user = User.objects.create_user(
            username='jane_teacher',
            password='password123',
            is_teacher=True
        )

        # 1. Check profile existence
        self.assertTrue(hasattr(user, 'teacher_profile'))
        self.assertIsInstance(user.teacher_profile, TeacherProfile)
        
        # 2. Test Teacher Specific Fields
        profile = user.teacher_profile
        profile.bio = "I have a PhD in Computer Science."
        # Note: We do NOT test office_location because you removed it.
        profile.save()
        
        saved_profile = TeacherProfile.objects.get(user=user)
        self.assertEqual(saved_profile.bio, "I have a PhD in Computer Science.")

    def test_superuser_has_no_profile(self):
        """
        Scenario: Create an admin.
        Expected: No extra profiles attached.
        """
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'pass')
        self.assertFalse(hasattr(admin, 'student_profile'))
        self.assertFalse(hasattr(admin, 'teacher_profile'))