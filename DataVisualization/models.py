from django.db import models


# Create your models here.


class Document(models.Model):
    document_id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=255, blank=True)
    document = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Title: {self.description} | File name: {self.document.name} | Uploaded at: {self.uploaded_at}"


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


from django.db import models


class tbl_Authentication(models.Model):
    Empcode = models.IntegerField()
    username = models.CharField(max_length=50, default='')
    password = models.CharField(max_length=50, default='')
    is_active = models.IntegerField(null=True)

    def __str__(self):
        return self.username

    empAuth_objects = models.Manager()
