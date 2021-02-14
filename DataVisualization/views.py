from django.http import HttpResponse

from rest_framework.views import APIView
from django.shortcuts import redirect
from pyexcel_xls import get_data as xls_get
from pyexcel_xlsx import get_data as xlsx_get
from django.utils.datastructures import MultiValueDictKeyError


class ParseExcel(APIView):
    def post(self, request, format=None):
        try:
            excel_file = request.FILES['files']
            if str(excel_file).split('.')[-1] == 'xls':
                data = xls_get(excel_file, column_limit=4)
            elif str(excel_file).split('.')[-1] == 'xlsx':
                data = xlsx_get(excel_file, column_limit=4)
            else:
                return HttpResponse("File format not valid.")
            print(data)
            return redirect('load_file.html')
        except MultiValueDictKeyError:
            return HttpResponse("Failed to upload Excel file.")


from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import FileSystemStorage

def simple_upload(request):
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile']
        fs = FileSystemStorage()
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = fs.url(filename)
        return render(request, 'simple_upload.html', {
            'uploaded_file_url': uploaded_file_url
        })
    return render(request, 'simple_upload.html')

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")