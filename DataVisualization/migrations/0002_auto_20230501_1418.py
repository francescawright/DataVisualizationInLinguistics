# Generated by Django 3.1.6 on 2023-05-01 14:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DataVisualization', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='title',
            field=models.CharField(blank=True, max_length=500, verbose_name='Description'),
        ),
    ]
