from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

# Get the actual user model (CustomUser) dynamically
User = get_user_model()

class AuthTests(APITestCase):
    
    def setUp(self):
        # Create a test user
        self.test_user = User.objects.create_user(
            username='testuser', 
            password='testpassword123', 
            email='test@example.com'
        )
        self.register_url = reverse('register_api')
        self.login_url = reverse('login_api')

    def test_register_success(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'securepassword123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_duplicate_username(self):
        data = {
            'username': 'testuser',
            'email': 'another@example.com',
            'password': 'password123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'WRONGpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_user(self):
        data = {
            'username': 'ghostuser',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)