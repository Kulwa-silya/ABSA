# Generated by Django 4.2.16 on 2024-11-01 12:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('qa_form', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='source',
            field=models.TextField(default=' '),
        ),
    ]