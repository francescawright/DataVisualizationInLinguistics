from django.views.generic import TemplateView
from django.http import HttpResponse
from django.shortcuts import render

from DataVisualization.utilities.ExcelParser import ExcelParser
from DataVisualization.models import Document, Commentary
from django.db.models import Count, Q

import pandas as pd


def index(request):
    parser = ExcelParser()
    parser.drop_database()
    for doc in Document.objects.all():
        parser.load_and_parse(doc)
    return render(request, 'base.html', context=None)


def test(request):
    dataset = Commentary.objects \
        .values('toxicity') \
        .annotate(toxicity_no=Count('toxicity', filter=Q(toxicity=0))) \
        .annotate(toxicity_yes=Count('toxicity', filter=Q(toxicity=1))) \
        .annotate(low_toxicity=Count('toxicity_level', filter=Q(toxicity_level=1))) \
        .annotate(med_toxicity=Count('toxicity_level', filter=Q(toxicity_level=2))) \
        .annotate(high_toxicity=Count('toxicity_level', filter=Q(toxicity_level=3)))

    dataset2 = Commentary.objects \
        .values('toxicity') \
        .annotate(sarcasm=Count('sarcasm', filter=Q(sarcasm=1))) \
        .annotate(argumentation=Count('argumentation', filter=Q(argumentation=1))) \
        .annotate(positive_stance=Count('positive_stance', filter=Q(positive_stance=1))) \
        .annotate(negative_stance=Count('negative_stance', filter=Q(negative_stance=1)))
    return render(request, 'test2.html', {'dataset': dataset, 'dataset2': dataset2})


def testButton(request):
    dataset = Commentary.objects \
        .values('toxicity') \
        .annotate(sarcasm=Count('sarcasm', filter=Q(sarcasm=1))) \
        .annotate(argumentation=Count('argumentation', filter=Q(argumentation=1))) \
        .annotate(positive_stance=Count('positive_stance', filter=Q(positive_stance=1))) \
        .annotate(negative_stance=Count('negative_stance', filter=Q(negative_stance=1)))

    print(dataset)
    return render(request, 'test3.html', {'dataset': dataset})


class TestChartView(TemplateView):
    template_name = "test.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["all"] = Commentary.objects.all()
        return context
