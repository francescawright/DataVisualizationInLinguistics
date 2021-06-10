from django import forms
from DataVisualization.models import Document


class FileForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = "__all__"
