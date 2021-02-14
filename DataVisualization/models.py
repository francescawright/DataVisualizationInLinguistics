from django.db import models

# Create your models here.


class Document(models.Model):
    description = models.CharField(max_length=255, blank=True)
    document = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Commentary(models.Model):
    comment_id = models.IntegerField()
    user_id = models.CharField(max_length=100)
    date = models.DateTimeField()
    thread = models.IntegerField()
    comment_level = models.IntegerField()
    toxicity_level = models.IntegerField()
    positive_stance = models.IntegerField()
    negative_stance = models.IntegerField()
