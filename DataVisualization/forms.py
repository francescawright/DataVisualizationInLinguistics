from django import forms
from DataVisualization.models import Document


class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ('description')
