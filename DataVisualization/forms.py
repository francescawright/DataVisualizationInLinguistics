from django import forms
from DataVisualization.models import Document
from django import forms


class FileForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = "__all__"


class UpdateFileForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['description','title', 'text_URL', 'comments_URL']


class Loginform(forms.Form):
    username = forms.CharField(max_length=25, label="Enter username")
    password = forms.CharField(max_length=30, label='Password', widget=forms.PasswordInput)
