# Generated by Django 4.2.16 on 2024-12-18 13:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('qa_form', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='post',
            name='reviewed_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_posts', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='post',
            name='status',
            field=models.CharField(choices=[('unreviewed', 'Unreviewed'), ('reviewed', 'Reviewed')], default='unreviewed', max_length=20),
        ),
    ]
