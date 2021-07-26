from django.utils.datastructures import MultiValueDictKeyError
from django.views.generic import TemplateView
from django.http import HttpResponse
from django.shortcuts import render

from DataVisualization.utilities.ExcelParser import ExcelParser
from DataVisualization.models import Document, Commentary
from django.db.models import Count, Q
import json
from django.conf import settings as django_settings
import os
from DataVisualization.forms import FileForm

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

    dataset3 = Commentary.objects \
        .values('toxicity') \
        .annotate(target_group=Count('target_group', filter=Q(target_group=1))) \
        .annotate(target_person=Count('target_person', filter=Q(target_person=1))) \
        .annotate(stereotype=Count('stereotype', filter=Q(stereotype=1)))

    documents_uploaded = Document.objects.all()
    return render(request, 'index.html',
                  context={'dataset': dataset, 'dataset2': dataset2, 'dataset3': dataset3,
                           'documents_uploaded': documents_uploaded})


def index_reyes(request):
    data = Commentary.objects.all()
    print(data)
    # return render(request, "tree_layout.html", context={"dataset": "test_json.json"})
    return render(request, "tree_layout.html", context={"dataset": data})


def index_reyes_force(request):
    return render(request, "force_layout.html", context={"dataset": "test_json.json"})


def index_reyes_radial(request):
    return render(request, "radial_layout.html", context={"dataset": "test_json.json"})


def manage_data(request):
    if request.method == 'POST':
        handle_delete_data(request)
    if (request.GET.get("save_button")):
        save_project()
    if (request.GET.get("export_button")):
        export_visualization()
    documents_uploaded = Document.objects.all()
    return render(request, 'manage_data.html', context={"documents_uploaded": documents_uploaded})


def parse_data(document):
    parser = ExcelParser()
    parser.load_and_parse(Document.objects.filter(description=document.description).first())


def delete_data(selected_data):
    parser = ExcelParser()
    parser.drop_database(selected_data)


def save_project():
    raise NotImplemented()


def export_visualization():
    raise NotImplemented()


def recursive_add_node(node, doc):
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
    children = [recursive_add_node(c, doc) for c in
                Commentary.objects.filter(document_id=doc).all().filter(thread=node.comment_id, comment_level=2)]
    if children:
        result["children"] = children
    # else:
    # result["size"] = 3534
    return result


def testD3(request):
    # print(request)
    print("POST", request.POST)
    selected_data = Document.objects.first().description

    targets = ["target_group", "target_person", "target_stereotype"]
    features = ["argumentation", "constructiveness", "sarcasm", "mockery", "intolerance",
                "improper_language", "insult",
                "aggressiveness"]
    cbTargets = {target: 0 for target in targets}
    cbFeatures = {feature: 0 for feature in features}
    cbFeatures["feature_group"] = 0

    if "from_button" in request.POST.keys():
        selected_data = request.POST['from_button']
    if "selected_data" in request.POST.keys():
        selected_data = request.POST["selected_data"]
    if "cbTargets" in request.POST.keys():
        for target in request.POST.getlist("cbTargets"):
            cbTargets[target.replace('-', '_')] = 1
    if "cbFeatures" in request.POST.keys():
        for feature in request.POST.getlist("cbFeatures"):
            cbFeatures[feature] = 1
    if "cbFeatureMenu" in request.POST.keys():
        cbFeatures[request.POST["cbFeatureMenu"].replace('-', '_')] = 1
    try:
        doc = Document.objects.filter(description=selected_data).first()
        selected_item = selected_data
    except MultiValueDictKeyError:
        doc = Document.objects.all()[0]
        selected_item = Document.objects.all()[0].description
    dataset = Commentary.objects.filter(document_id=doc).all()
    # print(dataset)

    # Filtramos todos los hijos de primer nivel.
    first_level = dataset.filter(comment_level=1)

    # Recursivamente añadimos sus hijos.
    data_list = [recursive_add_node(node, doc) for node in first_level]

    data = {"name": doc, "children": data_list}
    # print(json.dumps(data, default=str))
    # print(os.path)
    with open(os.path.join('DataVisualization/' + django_settings.STATIC_URL, 'output.json'), 'w') as outfile:
        json.dump(data, outfile, default=str)
    print(request.POST)
    try:
        selected_layout = request.POST["dropdown_layout"]
        template = "tree_layout.html"
        if request.POST["dropdown_layout"] == "Tree":
            template = "tree_layout.html"
        elif request.POST["dropdown_layout"] == "Force":
            template = "force_layout.html"
        elif request.POST["dropdown_layout"] == "Radial":
            template = "radial_layout.html"
    except MultiValueDictKeyError:
        selected_layout = "tree_layout.html"
        template = "tree_layout.html"
    layouts = ["Tree", "Force", "Radial"]

    d1 = Commentary.objects.filter(document_id=doc) \
        .values('toxicity') \
        .annotate(toxicity_no=Count('toxicity', filter=Q(toxicity=0))) \
        .annotate(toxicity_yes=Count('toxicity', filter=Q(toxicity=1))) \
        .annotate(low_toxicity=Count('toxicity_level', filter=Q(toxicity_level=1))) \
        .annotate(med_toxicity=Count('toxicity_level', filter=Q(toxicity_level=2))) \
        .annotate(high_toxicity=Count('toxicity_level', filter=Q(toxicity_level=3)))

    d2 = Commentary.objects.filter(document_id=doc) \
        .values('toxicity') \
        .annotate(sarcasm=Count('sarcasm', filter=Q(sarcasm=1))) \
        .annotate(argumentation=Count('argumentation', filter=Q(argumentation=1))) \
        .annotate(positive_stance=Count('positive_stance', filter=Q(positive_stance=1))) \
        .annotate(negative_stance=Count('negative_stance', filter=Q(negative_stance=1)))

    print(cbTargets)
    print(cbFeatures)
    return render(request, template,
                  {'dataset': 'output.json', 'options': Document.objects.all(), 'layouts': layouts,
                   'selected_layout': selected_layout,
                   'selected_item': selected_item, "d1": d1, "d2": d2,
                   'cbTargets': cbTargets, 'cbFeatures': cbFeatures})


def upload_file(request):
    if request.method == 'POST':
        file_form = FileForm(request.POST, request.FILES)
        if file_form.is_valid():
            handle_uploaded_file(request.FILES['document'])
            file_form.save()
            parse_data(Document.objects.last())
            return index(request)
    else:
        file_form = FileForm()
        return render(request, "upload_file.html", {'form': file_form})


def handle_uploaded_file(f):
    with open('DataVisualization/static/' + f.name, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
            ## WIP STUFF


def handle_delete_data(request):
    try:
        selected_data = request.POST["selected_data_delete"]
    except MultiValueDictKeyError as e:
        selected_data = Document.objects.first()
    delete_data(selected_data)
    return index(request)


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
