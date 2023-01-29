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
    handle_delete_data, signup_view, login_view, logout_view, save_first_login, generate_dataset,\
    generate_dataset_popup, create_subtree, delete_subtree, update_subtrees_menu, check_first_request_popup

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
    path('edit_data/<int:document_id>', edit_data, name='edit_data'),
    path('create_subtree/', create_subtree, name='create_subtree'),
    path('delete_subtree/<int:subtree_id>', delete_subtree, name='delete_subtree'),
    path('update_subtrees_menu/', update_subtrees_menu, name='update_subtrees_menu'),

    # Visualisation paths
    path('view_data/', main_form_handler),
    path('generate_dataset/', generate_dataset, name='generate_dataset'),
    path('generate_dataset_popup/', generate_dataset_popup, name='generate_dataset_popup'),
    path('selected_data/', main_form_handler, name='selected_data'),
    path('selected_layout/', main_form_handler, name='dropdown_layout'),
    path('check_first_request_popup/', check_first_request_popup, name='check_first_request_popup'),

    # User chat attributes
    path('save_first_login/', save_first_login, name='save_first_login'),
]
