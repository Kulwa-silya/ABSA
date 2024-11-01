from django import template

register = template.Library()

@register.filter
def add_one(value):
    return int(value) + 1
