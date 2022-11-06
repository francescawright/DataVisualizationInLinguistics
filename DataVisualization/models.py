from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.contrib.auth.admin import User
from django.dispatch import receiver
from django.db.models.signals import post_save

# Create your models here.


class Document(models.Model):
    document_id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=500)
    text_URL = models.URLField(max_length=2040)
    comments_URL = models.URLField(max_length=2040)
    document = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Description: {self.description}| Title: {self.title} | Text: {self.text_URL} | Comments: {self.comments_URL} | File name: {self.document.name} | Uploaded at: {self.uploaded_at}"


class Commentary(models.Model):
    document_id = models.ForeignKey(Document, on_delete=models.CASCADE)
    document_name = models.CharField(max_length=200)
    comment_id = models.IntegerField(blank=True)
    user_id = models.CharField(max_length=100, blank=True)
    date = models.DateTimeField(blank=True)
    thread = models.IntegerField(blank=True)
    comment_level = models.IntegerField(blank=True)
    comment = models.CharField(max_length=5000)
    argumentation = models.IntegerField(blank=True)
    constructivity = models.IntegerField(blank=True)
    positive_stance = models.IntegerField(blank=True)
    negative_stance = models.IntegerField(blank=True)
    target_person = models.IntegerField(blank=True)
    target_group = models.IntegerField(blank=True)
    stereotype = models.IntegerField(blank=True)
    sarcasm = models.IntegerField(blank=True)
    mockery = models.IntegerField(blank=True)
    insult = models.IntegerField(blank=True)
    improper_language = models.IntegerField(blank=True)
    aggressiveness = models.IntegerField(blank=True)
    intolerance = models.IntegerField(blank=True)
    toxicity = models.IntegerField(blank=True)
    toxicity_level = models.IntegerField(blank=True)

    def __str__(self):
        return f"Document id: {self.document_name} | Comment id: {self.comment_id} | User id: {self.user_id} | Date: {self.date} | " \
               f"Thread: {self.comment_level} | Toxicity Level: {self.toxicity_level} | " \
               f"Positive Stance: {self.positive_stance} | Negative Stance: {self.negative_stance}"


class Subtree(models.Model):
    subtree_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    node_ids = ArrayField(models.IntegerField(null=True, blank=True), null=True, blank=True)

    def __str__(self):
        return f"Document id: {self.document} | User ids: {self.user} | Node ids: {self.node_ids}"

    class Meta:
        unique_together = [["document", "user", "node_ids"],["user","name"]]


class tbl_Authentication(models.Model):
    Empcode = models.IntegerField()
    username = models.CharField(max_length=50, default='')
    password = models.CharField(max_length=50, default='')
    is_active = models.IntegerField(null=True)

    def __str__(self):
        return self.username

    empAuth_objects = models.Manager()


class ChatProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=100, blank=True)
    first_login = models.BooleanField()

    def __str__(self):
        return self.user.username

    @receiver(post_save, sender=User)
    def create_chat_profile(sender, instance, created, **kwargs):
        if created:
            ChatProfile.objects.create(user=instance,first_login=True, nickname="")

    @receiver(post_save, sender=User)
    def save_chat_profile(sender, instance, **kwargs):
        instance.chatprofile.save()
