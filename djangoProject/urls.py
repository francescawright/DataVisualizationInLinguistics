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
from DataVisualization.views import index, TestChartView, test, testButton, dashboard, test_boostrap, manage_data, \
    upload_data, delete_data, save_project, export_visualization, index_reyes, index_reyes_force, index_reyes_radial, \
    testD3

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index),
    path('test/', TestChartView.as_view(), name='test'),
    path('test2/', test, name='test2'),
    path('testButton/', testButton, name='testButton'),
    path('dashboard/', dashboard, name='dashboard'),
    path('test_dashboard/', dashboard, name="test_dashboard"),
    path('test_bootstrap/', test_boostrap),
    path('manage_data/', manage_data, name="manage_data"),
    path('view_data/', testD3),
    path('selected_data/', testD3, name='selected_data'),
    path('selected_layout/', testD3, name='dropdown_layout')

]
