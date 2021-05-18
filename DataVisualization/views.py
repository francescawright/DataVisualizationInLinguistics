from django.views.generic import TemplateView
from django.http import HttpResponse
from django.shortcuts import render

from DataVisualization.utilities.ExcelParser import ExcelParser
from DataVisualization.models import Document, Commentary
from django.db.models import Count, Q
import json
from django.conf import settings as django_settings
import os
import pandas as pd


def index(request):
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
    return render(request, 'index.html', context={'dataset': dataset, 'dataset2': dataset2})


def index_reyes(request):
    return render(request, "index_reyes.html", context={"dataset": "test_json.json"})


def index_reyes_force(request):
    return render(request, "index_force.html", context={"dataset": "test_json.json"})


def index_reyes_radial(request):
    return render(request, "index_radial.html", context={"dataset": "test_json.json"})


def manage_data(request):
    print(request)
    if (request.POST.get("upload_button")):
        upload_data(request)
    if (request.GET.get("delete_button")):
        delete_data()
    if (request.GET.get("save_button")):
        save_project()
    if (request.GET.get("export_button")):
        export_visualization()
    return render(request, 'manage_data.html', context=None)


def upload_data(request):
    parser = ExcelParser()
    for doc in Document.objects.all():
        parser.load_and_parse(doc)


def delete_data():
    parser = ExcelParser()
    parser.drop_database()


def save_project():
    raise NotImplemented()


def export_visualization():
    raise NotImplemented()


def recursive_add_node(node):
    result = {
        "name": node.comment_id,
        "user_id": node.user_id,
        "date": node.date,
        "thread": node.thread,
        "comment_level": node.comment_level,
        "coment": node.comment,
        "argumentation": node.argumentation,
        "constructiveness": node.constructivity,
        "positive_stance": node.positive_stance,
        "negative_stance": node.negative_stance,
        "target_person": node.target_person,
        "target_group": node.target_group,
        "stereotype": node.stereotype,
        "sarcasm": node.sarcasm,
        "mockery": node.mockery,
        "insult": node.insult,
        "improper_language": node.improper_language,
        "aggressiveness": node.aggressiveness,
        "intolerance": node.intolerance,
        "toxicity": node.toxicity,
        "toxicity_level": node.toxicity_level,
    }
    # children = [recursive_add_node(c) for c in Commentary.objects.all().filter(thread=node.comment_id)] lmao, peta porque se pilla a sí mismo
    # los comentarios de nivel 1 tienen como thread su mismo id!!
    children = [recursive_add_node(c) for c in Commentary.objects.all().filter(thread=node.comment_id, comment_level=2)]
    if children:
        result["children"] = children
    # else:
    # result["size"] = 3534
    return result


def testD3(request):
    dataset = Commentary.objects.all()
    print(dataset)

    # Filtramos todos los hijos de primer nivel.
    first_level = dataset.filter(comment_level=1)

    # Recursivamente añadimos sus hijos.
    data_list = [recursive_add_node(node) for node in first_level]

    data = {"name": "News Article", "children": data_list}
    # print(json.dumps(data, default=str))
    print(os.path)
    # with open(os.path.join(".." + django_settings.STATIC_URL, 'test_json.json'), 'w') as outfile:
    #    json.dump(data, outfile, default=str)
    return render(request, 'index.html', {'dataset': data})


## WIP STUFF

class TestChartView(TemplateView):
    template_name = "test.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["all"] = Commentary.objects.all()
        return context


def dashboard(request):
    options = {
        "chart_type": "column",
        "title": "Bar Chart",
        "stacking_type": "",
    }

    data = {
        "categories": ["Non-toxic comments", "Toxic Comments"],
        "dataset1": Commentary.objects \
            .values('toxicity') \
            .annotate(toxicity_no=Count('toxicity', filter=Q(toxicity=0))) \
            .annotate(toxicity_yes=Count('toxicity', filter=Q(toxicity=1))) \
            .annotate(low_toxicity=Count('toxicity_level', filter=Q(toxicity_level=1))) \
            .annotate(med_toxicity=Count('toxicity_level', filter=Q(toxicity_level=2))) \
            .annotate(high_toxicity=Count('toxicity_level', filter=Q(toxicity_level=3)))
    }
    return render(request, "test_dashboard.html", context={"options": options, "data": data})


def dashboard_2(request):
    options = {
        "chart_type": "column",
        "title": "Bar Chart",
        "stacking_type": "",
    }

    data = {
        "categories": ["Non-toxic comments", "Toxic Comments"],
        "dataset1": Commentary.objects \
            .values('toxicity') \
            .annotate(toxicity_no=Count('toxicity', filter=Q(toxicity=0))) \
            .annotate(toxicity_yes=Count('toxicity', filter=Q(toxicity=1))) \
            .annotate(low_toxicity=Count('toxicity_level', filter=Q(toxicity_level=1))) \
            .annotate(med_toxicity=Count('toxicity_level', filter=Q(toxicity_level=2))) \
            .annotate(high_toxicity=Count('toxicity_level', filter=Q(toxicity_level=3)))
    }
    return render(request, "test_dashboard.html", context={"options": options, "data": data})


def test_boostrap(request):
    return render(request, "test_boostrap.html")


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

    return render(request, 'test2.html', context={'dataset': dataset, 'dataset2': dataset2})


# TODO: try it in the dashboard
def testButton(request):
    dataset = Commentary.objects \
        .values('toxicity') \
        .annotate(sarcasm=Count('sarcasm', filter=Q(sarcasm=1))) \
        .annotate(argumentation=Count('argumentation', filter=Q(argumentation=1))) \
        .annotate(positive_stance=Count('positive_stance', filter=Q(positive_stance=1))) \
        .annotate(negative_stance=Count('negative_stance', filter=Q(negative_stance=1)))

    return render(request, 'test3.html', {'dataset': dataset})
