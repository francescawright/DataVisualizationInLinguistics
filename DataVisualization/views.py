
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
        .annotate(non_toxicity=Count('toxicity_level', filter=Q(toxicity_level=0))) \
        .annotate(low_toxicity=Count('toxicity_level', filter=Q(toxicity_level=1))) \
        .annotate(high_toxicity=Count('toxicity_level', filter=Q(toxicity_level=2)))
    print(dataset)
    return render(request, 'test.html', {'dataset': dataset})


def sales(request):
    """ view function for sales app """

    # read data

    df = pd.read_csv("DataVisualization/data/car_sales.csv")
    rs = df.groupby("Engine size")["Sales in thousands"].agg("sum")
    categories = list(rs.index)
    values = list(rs.values)

    table_content = df.to_html(index=None)

    table_content = table_content.replace("", "")
    table_content = table_content.replace('class="dataframe"', "class='table table-striped'")
    table_content = table_content.replace('border="1"', "")

    context = {"categories": categories, 'values': values, 'table_data': table_content}
    return render(request, 'sales.html', context=context)