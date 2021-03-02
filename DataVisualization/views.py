
from django.http import HttpResponse
from django.shortcuts import render

from DataVisualization.utilities.ExcelParser import ExcelParser
from DataVisualization.models import Document, Commentary

import pandas as pd


def index(request):
    parser = ExcelParser()
    parser.drop_database()
    for doc in Document.objects.all():
        parser.load_and_parse(doc)
    print(Commentary.objects.all())
    return HttpResponse("Hello, world.")


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