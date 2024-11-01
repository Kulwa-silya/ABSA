from django.shortcuts import render, redirect
from django.views.generic import View
from django.forms import formset_factory
from .forms import PostForm, CommentForm, AspectForm
from .models import Post, Comment, Aspect

class QAFormView(View):
    template_name = 'qa_form/form.html'
    steps = [
        (0, 'Post Caption'),
        (1, 'Comments'),
        (2, 'Review'),
    ]

    def get(self, request):
        post_form = PostForm()
        comment_form = CommentForm()
        AspectFormSet = formset_factory(AspectForm, extra=1)
        aspect_formset = AspectFormSet()

        return render(request, self.template_name, {
            'post_form': post_form,
            'comment_form': comment_form,
            'aspect_formset': aspect_formset,
            'current_step': request.session.get('current_step', 0),
            'steps': self.steps,
        })

    def post(self, request):
        current_step = request.session.get('current_step', 0)

        if 'next' in request.POST:
            request.session['current_step'] = min(current_step + 1, 2)
        elif 'back' in request.POST:
            request.session['current_step'] = max(current_step - 1, 0)
        elif 'submit' in request.POST:
            post_form = PostForm(request.POST)
            comment_form = CommentForm(request.POST)
            AspectFormSet = formset_factory(AspectForm)
            aspect_formset = AspectFormSet(request.POST)

            if all([post_form.is_valid(), comment_form.is_valid(), aspect_formset.is_valid()]):
                post = post_form.save()
                comment = comment_form.save(commit=False)
                comment.post = post
                comment.save()

                for aspect_form in aspect_formset:
                    if aspect_form.is_valid():
                        aspect = aspect_form.save(commit=False)
                        aspect.comment = comment
                        aspect.save()

                request.session['current_step'] = 0
                return redirect('qa_form:success')

        return redirect('qa_form:form')

class SuccessView(View):
    template_name = 'qa_form/success.html'

    def get(self, request):
        return render(request, self.template_name)
