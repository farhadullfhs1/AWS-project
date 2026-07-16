from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='pickup_branch',
            field=models.CharField(blank=True, choices=[('Thane', 'Thane'), ('Mulund', 'Mulund'), ('Bandra', 'Bandra'), ('Kurla', 'Kurla'), ('Dadar', 'Dadar')], default='Thane', max_length=20),
        ),
    ]
