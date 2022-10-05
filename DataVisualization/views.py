import json
import os
from urllib.parse import urlparse

from django.conf import settings as django_settings
from django.db.models import Count, Q
from django.shortcuts import render
from django.utils.datastructures import MultiValueDictKeyError

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist, EmptyResultSet

from .models import tbl_Authentication
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User

from DataVisualization.forms import FileForm
from DataVisualization.models import Document, Commentary
from DataVisualization.utilities.ExcelParser import ExcelParser

from cryptography.fernet import Fernet

TARGETS = ["target_group", "target_person", "target_stereotype"]
FEATURES = ["argumentation", "constructiveness", "sarcasm", "mockery", "intolerance",
            "improper_language", "insult",
            "aggressiveness"]
FILTERS = ["highlight_toxicity_0", "highlight_toxicity_1", "highlight_toxicity_2", "highlight_toxicity_3"] + \
          ["highlight_stance_neutral", "highlight_stance_positive", "highlight_stance_negative"] + \
          ["highlight_" + target for target in TARGETS] + \
          ["highlight_features_" + feature for feature in FEATURES] + \
          ["highlight_OR_selectAll_toxicity", "highlight_OR_selectAll_stance", "highlight_OR_selectAll_target",
           "highlight_OR_selectAll_features"] + \
          ["highlight_AND_selectAll_target", "highlight_AND_selectAll_features"]

COMMONS = ["and_group", "or_group"]

LAYOUTS = ["Tree", "Force", "Radial"]
TREE_LAYOUT = "tree_layout_button"
FORCE_LAYOUT = "force_layout_button"
RADIAL_LAYOUT = "radial_layout_button"
TREEMAP_LAYOUT = "treeMap_layout_button"


def index(request):
    return render(request, 'index.html', context={'documents_uploaded': get_all_documents(), 'user': request.user})


def get_all_documents():
    return Document.objects.all()


def main_form_handler(request):
    # CURRENT DATASET
    # ---------------------------------------------------------------------------------
    selected_item, dataset, doc = get_current_dataset(request)
    # ---------------------------------------------------------------------------------

    # CHECKBOXES
    # ---------------------------------------------------------------------------------
    # Create two dicts that holds the values of the checkboxes from Targets and Features
    cbTargets = {target: 0 for target in TARGETS}
    cbFeatures = {feature: 0 for feature in FEATURES}
    cbFilterOR = {feature: 0 for feature in FILTERS}
    cbFilterAND = {feature: 0 for feature in FILTERS}
    cbCommons = {feature: 0 for feature in COMMONS}
    handle_checkboxes(request, cbTargets, cbFeatures, cbFilterOR, cbFilterAND, cbCommons)
    # ---------------------------------------------------------------------------------

    # ICONS
    # ---------------------------------------------------------------------------------
    selected_icons = handle_icons(request)
    # ---------------------------------------------------------------------------------

    # JSON PARSING
    # ---------------------------------------------------------------------------------
    # Filter first level childs
    first_level = dataset.filter(comment_level=1)
    save_data_to_JSON(first_level, doc)
    # ---------------------------------------------------------------------------------

    selected_layout, template, checked_layout = get_selected_layout(request)

    # ? Uncomment this line in order to obtain the auxiliary_charts in visualization.
    # d1, d2 = auxiliary_charts(doc)

    return render(request, template,
                  {'dataset': 'output.json', 'options': get_all_documents(), 'layouts': LAYOUTS,
                   'selected_layout': selected_layout,
                   'checked_layout': checked_layout,
                   'selected_item': selected_item,
                   'selected_icons': selected_icons,
                   # ? Uncomment this line in order to obtain the auxiliary_charts in visualization.
                   # "d1": d1, "d2": d2,
                   'cbTargets': cbTargets, 'cbFeatures': cbFeatures, 'cbFilterOR': cbFilterOR,
                   'cbFilterAND': cbFilterAND, 'cbCommons': cbCommons})


# Auxiliary Form Handler functions
# ---------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------
def handle_checkboxes(request, cbTargets, cbFeatures, cbFilterOR, cbFilterAND, cbCommons):
    if "cbTargets" in request.POST.keys():
        for target in request.POST.getlist("cbTargets"):
            cbTargets[target.replace('-', '_')] = 1
    if "cbFeatures" in request.POST.keys():
        for feature in request.POST.getlist("cbFeatures"):
            cbFeatures[feature] = 1
    if "cbFeatureMenu" in request.POST.keys():
        cbFeatures[request.POST["cbFeatureMenu"].replace('-', '_')] = 1
    if "cbHighlightOR" in request.POST.keys():
        for filterOR in request.POST.getlist("cbHighlightOR"):
            cbFilterOR[filterOR.replace('-', '_')] = 1
    if "cbHighlightAND" in request.POST.keys():
        for filterAND in request.POST.getlist("cbHighlightAND"):
            cbFilterAND[filterAND.replace('-', '_')] = 1
    if "cbHighlightProperty" in request.POST.keys():
        for common in request.POST.getlist("cbHighlightProperty"):
            cbCommons[common.replace('-', '_')] = 1
    else:
        cbCommons["and_group"] = 1


def get_current_dataset(request):
    selected_data = Document.objects.first().description
    if "from_button" in request.POST.keys():
        selected_data = request.POST['from_button']
    if "selected_data" in request.POST.keys():
        selected_data = request.POST["selected_data"]

    try:
        doc = Document.objects.filter(description=selected_data).first()
        selected_item = selected_data
    except MultiValueDictKeyError:
        doc = Document.objects.all()[0]
        selected_item = Document.objects.all()[0].description
    dataset = Commentary.objects.filter(document_id=doc).all()
    return selected_item, dataset, doc


def handle_icons(request):
    if "dots_icon_button" in request.POST.keys():
        return "dots"
    elif "glyphs_icon_button" in request.POST.keys():
        return "glyphs"
    return "dots"


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
    children = [recursive_add_node(c, doc) for c in
                Commentary.objects.filter(document_id=doc).all().filter(thread=node.comment_id, comment_level=2)]
    if children:
        result["children"] = children
    return result


def save_data_to_JSON(first_level, doc):
    # Recursivamente añadimos sus hijos.
    data_list = [recursive_add_node(node, doc) for node in first_level]

    data = {"name": doc, "children": data_list}
    with open(os.path.join('DataVisualization/' + django_settings.STATIC_URL, 'output.json'), 'w') as outfile:
        json.dump(data, outfile, default=str)


def get_selected_layout(request):
    if TREE_LAYOUT in request.POST.keys():
        selected_layout = "tree_layout.html"
        template = "tree_layout.html"
        button_checked = "tree"
    elif FORCE_LAYOUT in request.POST.keys():
        selected_layout = "force_layout.html"
        template = "force_layout.html"
        button_checked = "force"
    elif RADIAL_LAYOUT in request.POST.keys():
        selected_layout = "radial_layout.html"
        template = "radial_layout.html"
        button_checked = "radial"
    elif TREEMAP_LAYOUT in request.POST.keys():
        selected_layout = "treeMap_layout.html"
        template = "treeMap_layout.html"
        button_checked = "treeMap"
    else:
        # selected_layout = "treeMap_layout.html"
        # template = "treeMap_layout.html"
        # button_checked = "treeMap"
        selected_layout = "tree_layout.html"
        template = "tree_layout.html"
        button_checked = "tree"
    # try:
    #     #     selected_layout = request.POST["dropdown_layout"]
    #     #     template = "tree_layout.html"
    #     #     if request.POST["dropdown_layout"] == "Tree":
    #     #         template = "tree_layout.html"
    #     #     elif request.POST["dropdown_layout"] == "Force":
    #     #         template = "force_layout.html"
    #     #     elif request.POST["dropdown_layout"] == "Radial":
    #     #         template = "radial_layout.html"
    # except MultiValueDictKeyError:
    #     selected_layout = "tree_layout.html"
    #     template = "tree_layout.html"

    return selected_layout, template, button_checked


def auxiliary_charts(doc):
    # Auxiliary charts
    # ----------------
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
    # ----------------
    return d1, d2


# ---------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------


# Manage Data functions
# ---------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------
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
        return render(request, "upload_file.html",
                      context={'form': file_form, 'documents_uploaded': get_all_documents()})


def handle_uploaded_file(f):
    with open('DataVisualization/static/' + f.name, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)


def edit_data(request):
    return index(request)


def handle_delete_data(request):
    print(request.POST)
    try:
        selected_data = request.POST["delete_button"]
    except MultiValueDictKeyError as e:
        selected_data = Document.objects.first()
    print(selected_data)
    delete_data(selected_data)
    return index(request)


def manage_data(request):
    if request.method == 'POST':
        handle_delete_data(request)
    if request.GET.get("save_button"):
        save_project()
    if request.GET.get("export_button"):
        export_visualization()
    return index(request)


def parse_data(document):
    parser = ExcelParser()
    parser.load_and_parse(Document.objects.filter(
        description=document.description).first())


def delete_data(selected_data):
    parser = ExcelParser()
    parser.drop_database(selected_data)


def save_project():
    raise NotImplementedError()


def export_visualization():
    raise NotImplementedError()


# ---------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------
# ---------------------------------------------------------------------------------

from django.shortcuts import render, redirect
from .forms import Loginform
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout


def login_view(request):

    if request.POST.get('username') and request.POST.get('password') and request.POST.get('chatbot') == "true":
        request = decrypt_login_params(request)

    form = Loginform(request.POST or None)

    if request.POST.get('username') and request.POST.get('password') and request.POST.get('chatbot') == "true":
        return login_process(request, form, request.POST.get('username'), request.POST.get('password'))

    elif form.is_valid():
        uservalue = form.cleaned_data.get('username')
        passwordvalue = form.cleaned_data.get('password')

        return login_process(request, form, uservalue, passwordvalue)
    else:
        context = {'form': form}
        return render(request, 'login.html', context)

def decrypt_login_params (request):
    key = b'ZeuY3kEaYn2XkyPQPQKgDmDeDRJfKYM3-tTx_5NmMm4='
    request.POST = request.POST.copy()
    request.POST['username'] = decrypt(str.encode(request.POST.get('username')), key).decode()
    request.POST['password'] = decrypt(str.encode(request.POST.get('password')), key).decode()
    return request

def login_process(request, form, uservalue, passwordvalue):
    user = authenticate(username=uservalue, password=passwordvalue)
    if user is not None and request.user.get_username() != user.get_username():
        login(request, user)
        messages.success(request, "The login has been successful")
        if request.POST.get('chatbot') == "true":
            return render(request, 'index.html', context={'documents_uploaded': get_all_documents(), 'user': request.user, 'storage_clear': 'login'})
        else:
            return render(request, 'index.html', context={'documents_uploaded': get_all_documents(), 'user': request.user, 'storage_clear': 'nochat'})
    elif user is not None and request.user.get_username() == user.get_username():
        return login_exception(request,"same_username", form)
    else:
        return login_exception(request, "bad_credentials", form)

def login_exception(request, error, form):
    #Django Messages
    if (error == "same_username"):
        messages.error(request, "Attempting to log in as the current user")
    elif (error == "bad_credentials"):
        messages.error(request, "The username and password combination is incorrect")
    else:
        messages.error(request, 'An error has occurred')

    if (request.POST.get('chatbot') == "true"):
        if (error == "same_username"):
            errorMessage = "The username you have given me matches the username of your current session"
        elif (error == "bad_credentials"):
            errorMessage = "The username and password combination you have given me is not valid"
        else:
            errorMessage = "An error has occurred"

        return getTemplateByPath(request, errorMessage)
    else:
        context = {'form': form}
        return render(request, 'login.html', context)

def signup_view(request):
    if request.method == 'POST':
        if request.POST.get('username') and request.POST.get('password1') and request.POST.get('password2') and request.POST.get('chatbot') == "true":
            request = decrypt_signup_params(request)

        form = UserCreationForm(request.POST)

        if (User.objects.filter(username=request.POST.get('username')).exists()):
            return signup_exception(request, "username", form)
        elif (request.POST.get('password1') != request.POST.get('password2')):
            return signup_exception(request, "password", form)

        messageText = "The user has been created successfully"
        if not request.POST.get('chatbot') == "true":
            if form.is_valid():
                user = form.save()
                login(request, user)
                messages.success(request, messageText)
                return render(request, 'index.html',
                              context={'documents_uploaded': get_all_documents(), 'user': request.user,
                                       'storage_clear': 'nochat'})
        else:
            user = User.objects.create_user(username=request.POST['username'], password=request.POST['password1'])
            login(request, user)
            messages.success(request, messageText)
            return render(request, 'index.html',
                          context={'documents_uploaded': get_all_documents(), 'user': request.user,
                                   'storage_clear': 'signup'})
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def decrypt_signup_params (request):
    key = b'JlgbJKpxVhwF3NXJf_n-lt4c4AvdCATnuXYDK4xivPY='
    request.POST = request.POST.copy()
    request.POST['username'] = decrypt(str.encode(request.POST.get("username")), key).decode()
    request.POST['password1'] = decrypt(str.encode(request.POST.get("password1")), key).decode()
    request.POST['password2'] = decrypt(str.encode(request.POST.get("password2")), key).decode()

    return request

def signup_exception(request, error, form):
    # Django Messages
    if (error == "password"):
        messages.error(request, "The two passwords provided do not match")
    elif (error == "username"):
        messages.error(request, "A user with that username already exists")
    else:
        messages.error(request, "An error has occurred")

    if (request.POST.get('chatbot') == "true"):
        if (error == "password"):
            errorMessage = "I have not been able to register the user, the two passwords you have given me do not match"
        elif (error == "username"):
            errorMessage = "I have not been able to register the user, there is already a user with this name"
        else:
            errorMessage = "An error has occurred"

        return getTemplateByPath(request, errorMessage)
    else:
        return render(request, 'signup.html', {'form': form})

def logout_view(request):

    # Check if there is an active session
    user = getattr(request, 'user', None)
    if not user or not getattr(user, 'is_authenticated', True):
        response = logout_exception(request)
    else:
        logout(request)
        messages.success(request, "Your session has been successfully closed")
        if (request.GET.get("chatbot") == "true"):
            response = render(request, 'index.html', context={'documents_uploaded': get_all_documents(), 'user': request.user, 'storage_clear': 'logout'})
        else:
            response = render(request, 'index.html', context={'documents_uploaded': get_all_documents(), 'user': request.user, 'storage_clear': 'nochat'})

    return response

def logout_exception(request):
    messages.error(request, "No active session detected to be closed")
    if (request.GET.get("chatbot") == "true"):
        errorMessage = "It is not possible to close a session that does not exist, you are not logged in..."
        return getTemplateByPath(request, errorMessage)
    else:
        return render(request, 'index.html', context={'documents_uploaded': get_all_documents(), 'user': request.user})

def encrypt(message: bytes, key: bytes) -> bytes:
    return Fernet(key).encrypt(message)

def decrypt(token: bytes, key: bytes) -> bytes:
    return Fernet(key).decrypt(token)

def getTemplateByPath(request, errorMessage):

    path = urlparse(request.META['HTTP_REFERER']).path

    # Other tempaltes such as /edit_data/ will have to be added when they are implemented
    if path == "/" or path == "/logout/":
        return render(request, 'index.html', context={'documents_uploaded': get_all_documents(), 'user': request.user, 'chatbot_error': errorMessage})
    elif path == "/login/":
        form = Loginform()
        return render(request, 'login.html', context={'form': form, 'chatbot_error': errorMessage})
    elif path == "/signup/":
        form = UserCreationForm()
        return render(request, 'signup.html', {'form': form, 'chatbot_error': errorMessage})
    elif path == "/selected_data/":
        pass
    elif path == "/upload_file/":
        file_form = FileForm()
        return redirect("upload_file")