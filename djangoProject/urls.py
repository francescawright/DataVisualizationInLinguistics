"""djangoProject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from DataVisualization.views import index, manage_data, upload_file, main_form_handler, edit_data, \
    handle_delete_data, signup_view, login_view, logout_view, save_user_chat, save_bot_chat, save_error_chat, \
    save_nickname, save_first_login

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name="index"),

    # Users
    path('login/', login_view, name="login"),
    path('signup/', signup_view, name="signup"),
    path('logout/', logout_view, name="logout"),

    # Manage Data
    path('manage_data/', manage_data, name="manage_data"),
    path('upload_file/', upload_file, name="upload_file"),
    path('delete_data/', handle_delete_data, name='delete_data'),
    path('edit_data/', edit_data, name='edit_data'),

    # Visualisation paths
    path('view_data/', main_form_handler),
    path('selected_data/', main_form_handler, name='selected_data'),
    path('selected_layout/', main_form_handler, name='dropdown_layout'),

    # Chat logs paths
    path('user_chat_log/', save_user_chat, name='user_chat_log'),
    path('bot_chat_log/', save_bot_chat, name='bot_chat_log'),
    path('error_chat_log/', save_error_chat, name='error_chat_log'),

    # User chat attributes
    path('save_nickname/', save_nickname, name='save_nickname'),
    path('save_first_login/', save_first_login, name='save_first_login'),
]
