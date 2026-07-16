from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Hot Coffee', 'Hot Coffee'),
        ('Cold Coffee', 'Cold Coffee'),
        ('Tea', 'Tea'),
        ('Bakery', 'Bakery'),
        ('Breakfast', 'Breakfast'),
        ('Snacks', 'Snacks'),
    ]

    name = models.CharField(max_length=120)
    desc = models.TextField() # Renamed to match frontend 'desc'
    price = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Hot Coffee')
    image = models.URLField(max_length=500, blank=True) # Using URL for simplicity
    rating = models.FloatField(default=4.5)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name
