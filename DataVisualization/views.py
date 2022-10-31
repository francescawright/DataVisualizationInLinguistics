import json
import os
from urllib.parse import urlparse

from django.conf import settings as django_settings
from django.db.models import Count, Q
from django.utils.datastructures import MultiValueDictKeyError
from django.http import HttpResponse

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist, EmptyResultSet

from .models import tbl_Authentication
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User

from DataVisualization.forms import FileForm, UpdateFileForm
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
    storageClear = request.GET.get('storageClear', '')
    errorMessage = request.GET.get('chatbotError', '')
    if (errorMessage):
        errorMessage = getChatErrorMessage(request, errorMessage)

    return render(request, 'index.html', context={'documents_uploaded': get_all_documents(), 'user': request.user,
                                                  'storage_clear': storageClear, 'chatbot_error': errorMessage})


def storage_clear_index(request, clear_type):
    return redirect(reverse('index') + '?storageClear=' + clear_type)


def get_all_documents():
    return Document.objects.all()


@require_http_methods(["POST"])
def save_nickname(request):
    user = getattr(request, 'user', None)
    user.chatprofile.nickname = request.POST['nickname']
    user.save()
    return HttpResponse(status=204)


@require_http_methods(["POST"])
def save_first_login(request):
    user = getattr(request, 'user', None)
    user.chatprofile.first_login = request.POST['first_login']
    user.save()
    return HttpResponse(status=204)


def generate_dataset (request):
    # Check if there is an active session
    user = getattr(request, 'user', None)
    if not user or not getattr(user, 'is_authenticated', True):
        return HttpResponse("open_document_no_active_session")

    # CURRENT ITEM
    # ---------------------------------------------------------------------------------
    selected_item = None
    if "from_button" in request.POST.keys():
        selected_item = request.POST['from_button']
    if "selected_data" in request.POST.keys():
        selected_item = request.POST["selected_data"]
    # ---------------------------------------------------------------------------------
    # JSON PARSING & CURRENT DATASET
    # ---------------------------------------------------------------------------------
    try:
        dataset, doc = get_current_dataset(request, selected_item)
    except ObjectDoesNotExist:
        return HttpResponse("document_not_exist")
    # Filter first level childs
    first_level = dataset.filter(comment_level=1)
    save_data_to_JSON(first_level, doc)
    # ---------------------------------------------------------------------------------
    return HttpResponse("/static/output.json")

def main_form_handler(request):
    # Check if there is an active session
    user = getattr(request, 'user', None)
    if not user or not getattr(user, 'is_authenticated', True):
        return open_document_exception(request, "open_document_no_active_session")

    storageClear = request.GET.get('storageClear', '')
    errorMessage = request.GET.get('chatbotError', '')
    if (errorMessage):
        errorMessage = getChatErrorMessage(request, errorMessage)

    successMessage = ''
    if (request.POST.get('chatbot') == "true"):
        successMessage = "I have selected the best visualization according to the graph characteristics"

    try:
        selected_item, cbTargets, cbFeatures, cbFilterOR, cbFilterAND, cbCommons, selected_icons, selected_layout, template, checked_layout = main_form_context(
            request)
    except ObjectDoesNotExist:
        return open_document_exception(request, "document_not_exist")

    return render(request, template,
                  {'dataset': 'output.json', 'options': get_all_documents(), 'layouts': LAYOUTS,
                   'selected_layout': selected_layout,
                   'checked_layout': checked_layout,
                   'selected_item': selected_item,
                   'selected_icons': selected_icons,
                   # ? Uncomment this line in order to obtain the auxiliary_charts in visualization.
                   # "d1": d1, "d2": d2,
                   'cbTargets': cbTargets, 'cbFeatures': cbFeatures, 'cbFilterOR': cbFilterOR,
                   'cbFilterAND': cbFilterAND, 'cbCommons': cbCommons, 'storage_clear': storageClear,
                   'chatbot_error': errorMessage, 'chatbot_success': successMessage})


def main_form_context(request):
    # CURRENT ITEM
    # ---------------------------------------------------------------------------------
    selected_item = Document.objects.first().description
    if "from_button" in request.POST.keys():
        selected_item = request.POST['from_button']
    if "selected_data" in request.POST.keys():
        selected_item = request.POST["selected_data"]
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

    # JSON PARSING & CURRENT DATASET
    # ---------------------------------------------------------------------------------
    # Indicates whether the request is to work on the previous file,
    # for which the best display layout has already been selected.
    best_layout_selected = request.POST.get('best_layout_selected')
    if not best_layout_selected:
        dataset, doc = get_current_dataset(request, selected_item)
        # Filter first level childs
        first_level = dataset.filter(comment_level=1)
        save_data_to_JSON(first_level, doc)
    # ---------------------------------------------------------------------------------

    selected_layout, template, checked_layout = get_selected_layout(request)

    # ? Uncomment this line in order to obtain the auxiliary_charts in visualization.
    # d1, d2 = auxiliary_charts(doc)

    return selected_item, cbTargets, cbFeatures, cbFilterOR, cbFilterAND, cbCommons, selected_icons, selected_layout, template, checked_layout


def open_document_exception(request, error):
    # Django Messages
    if (error == "document_not_exist"):
        messages.error(request, "The document you want to open does not exist")

        request.POST = request.POST.copy()
        if "from_button" in request.POST.keys():
            request.POST['from_button'] = Document.objects.first().description
        if "selected_data" in request.POST.keys():
            request.POST["selected_data"] = Document.objects.first().description
    elif (error == "open_document_no_active_session"):
        messages.error(request, "Log in to access the documents")
    else:
        messages.error(request, "An error has occurred")

    if (request.POST.get('chatbot') == "true"):
        return getTemplateByPath(request, error)
    else:
        if (error == "open_document_no_active_session"):
            return redirect("index")
        else:
            if "from_button" in request.POST.keys():
                return redirect("index")
            elif "selected_data" in request.POST.keys():
                selected_item, cbTargets, cbFeatures, cbFilterOR, cbFilterAND, cbCommons, selected_icons, selected_layout, template, checked_layout = main_form_context(
                    request)

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


def get_current_dataset(request, selected_data):
    doc = Document.objects.filter(description=selected_data).first()
    if not (doc):
        raise ObjectDoesNotExist('document_not_exist')
    dataset = Commentary.objects.filter(document_id=doc).all()
    return dataset, doc


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

    data = {"name": doc, "title": doc.title, "text_URL" : doc.text_URL, "comments_URL" : doc.comments_URL, "children": data_list}
    with open(os.path.join('DataVisualization/' + django_settings.STATIC_URL, 'output.json'), 'w') as outfile:
        json.dump(data, outfile, default=str)


def get_selected_layout(request):
    best_layout_selected = request.POST.get('best_layout_selected')
    if best_layout_selected:
        selected_layout = best_layout_selected + "_layout.html"
        template = best_layout_selected + "_layout.html"
        button_checked = best_layout_selected
    elif TREE_LAYOUT in request.POST.keys():
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
            messages.success(request, "Document has been uploaded correctly")
            return index(request)
        else:
            messages.error(request, "The form received is not valid")
            file_form = FileForm()
            return render(request, "upload_file.html",
                          context={'form': file_form, 'documents_uploaded': get_all_documents()})
    else:
        file_form = FileForm()
        return render(request, "upload_file.html",
                      context={'form': file_form, 'documents_uploaded': get_all_documents()})


def handle_uploaded_file(f):
    with open('DataVisualization/static/' + f.name, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)


def edit_data(request, document_id):
    document = Document.objects.get(pk=document_id)
    form = UpdateFileForm(request.POST or None, instance=document)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, "Document has been updated correctly")
            return index(request)
        else:
            messages.error(request, "The form received is not valid")
            return render(request, "upload_file.html",
                          context={'form': form, 'documents_uploaded': get_all_documents()})
    else:
        return render(request, 'update_file.html', {'documents_uploaded': get_all_documents(), 'document': document, 'form': form})



def handle_delete_data(request):
    try:
        selected_data = request.POST["delete_button"]
    except MultiValueDictKeyError as e:
        selected_data = Document.objects.first()
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

from django.shortcuts import render, redirect, reverse
from .forms import Loginform
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout


def login_view(request):
    storageClear = request.GET.get('storageClear', '')
    errorMessage = request.GET.get('chatbotError', '')
    if (errorMessage):
        errorMessage = getChatErrorMessage(request, errorMessage)

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
        context = {'form': form, 'storage_clear': storageClear, 'chatbot_error': errorMessage}
        return render(request, 'login.html', context)


def decrypt_login_params(request):
    key = b'ZeuY3kEaYn2XkyPQPQKgDmDeDRJfKYM3-tTx_5NmMm4='
    request.POST = request.POST.copy()
    request.POST['username'] = decrypt(str.encode(request.POST.get('username')), key).decode()
    request.POST['password'] = decrypt(str.encode(request.POST.get('password')), key).decode()
    return request


def login_process(request, form, uservalue, passwordvalue):
    user = authenticate(username=uservalue, password=passwordvalue)
    if user is not None and request.user.get_username() != user.get_username():
        login(request, user)
        if request.POST.get('chatbot') == "true":
            return storage_clear_index(request, 'login')
        else:
            return storage_clear_index(request, 'nochat')
    elif user is not None and request.user.get_username() == user.get_username():
        return login_exception(request, "same_username", form)
    else:
        return login_exception(request, "bad_credentials", form)


def login_exception(request, error, form):
    # Django Messages
    if (error == "same_username"):
        messages.error(request, "Attempting to log in as the current user")
    elif (error == "bad_credentials"):
        messages.error(request, "The username and password combination is incorrect")
    else:
        messages.error(request, 'An error has occurred')

    if (request.POST.get('chatbot') == "true"):
        return getTemplateByPath(request, error)
    else:
        return render(request, 'login.html', context={'form': form})


def signup_view(request):
    storageClear = request.GET.get('storageClear', '')
    errorMessage = request.GET.get('chatbotError', '')
    if (errorMessage):
        errorMessage = getChatErrorMessage(request, errorMessage)

    if request.method == 'POST':
        if request.POST.get('username') and request.POST.get('password1') and request.POST.get(
                'password2') and request.POST.get('chatbot') == "true":
            request = decrypt_signup_params(request)

        form = UserCreationForm(request.POST)

        if (User.objects.filter(username=request.POST.get('username')).exists()):
            return signup_exception(request, "username_already_exists", form)
        elif (request.POST.get('password1') != request.POST.get('password2')):
            return signup_exception(request, "passwords_not_match", form)

        messageText = "The user has been created successfully"
        if not request.POST.get('chatbot') == "true":
            if form.is_valid():
                user = form.save()
                login(request, user)
                messages.success(request, messageText)
                return storage_clear_index(request, 'nochat')
        else:
            user = User.objects.create_user(username=request.POST['username'], password=request.POST['password1'])
            login(request, user)
            messages.success(request, messageText)
            return storage_clear_index(request, 'signup')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html',
                  context={'form': form, 'storage_clear': storageClear, 'chatbot_error': errorMessage})


def decrypt_signup_params(request):
    key = b'JlgbJKpxVhwF3NXJf_n-lt4c4AvdCATnuXYDK4xivPY='
    request.POST = request.POST.copy()
    request.POST['username'] = decrypt(str.encode(request.POST.get("username")), key).decode()
    request.POST['password1'] = decrypt(str.encode(request.POST.get("password1")), key).decode()
    request.POST['password2'] = decrypt(str.encode(request.POST.get("password2")), key).decode()

    return request


def signup_exception(request, error, form):
    # Django Messages
    if (error == "passwords_not_match"):
        messages.error(request, "The two passwords provided do not match")
    elif (error == "username_already_exists"):
        messages.error(request, "A user with that username already exists")
    else:
        messages.error(request, "An error has occurred")

    if (request.POST.get('chatbot') == "true"):
        return getTemplateByPath(request, error)
    else:
        return render(request, 'signup.html', context={'form': form})


def logout_view(request):
    # Check if there is an active session
    user = getattr(request, 'user', None)
    if not user or not getattr(user, 'is_authenticated', True):
        response = logout_exception(request, "logout_no_active_session")
    else:
        logout(request)
        messages.success(request, "Your session has been successfully closed")
        if (request.GET.get("chatbot") == "true"):
            response = storage_clear_index(request, 'logout')
        else:
            response = storage_clear_index(request, 'nochat')

    return response


def logout_exception(request, error):
    messages.error(request, "No active session detected to be closed")
    if (request.GET.get("chatbot") == "true"):
        return getTemplateByPath(request, error)
    else:
        return redirect(reverse('index'))


def encrypt(message: bytes, key: bytes) -> bytes:
    return Fernet(key).encrypt(message)


def decrypt(token: bytes, key: bytes) -> bytes:
    return Fernet(key).decrypt(token)


def getTemplateByPath(request, errorMessage):

    path = urlparse(request.META['HTTP_REFERER']).path

    # Other tempaltes such as /edit_data/ will have to be added when they are implemented
    if path == "/" or path == "/logout/":
        return redirect(reverse('index') + '?chatbotError=' + errorMessage)
    elif path == "/login/":
        form = Loginform()
        return redirect(reverse('login') + '?chatbotError=' + errorMessage)
    elif path == "/signup/":
        return redirect(reverse('signup') + '?chatbotError=' + errorMessage)
    elif path == "/selected_data/":

        if (errorMessage == "open_document_no_active_session"):
            return redirect(reverse('index') + '?chatbotError=' + errorMessage)
        elif (errorMessage == "document_not_exist"):

            errorMessage = getChatErrorMessage(request, errorMessage)

            selected_item, cbTargets, cbFeatures, cbFilterOR, cbFilterAND, cbCommons, selected_icons, selected_layout, template, checked_layout = main_form_context(request)

            return render(request, template,
                          {'dataset': 'output.json', 'options': get_all_documents(), 'layouts': LAYOUTS,
                           'selected_layout': selected_layout,
                           'checked_layout': checked_layout,
                           'selected_item': selected_item,
                           'selected_icons': selected_icons,
                           # ? Uncomment this line in order to obtain the auxiliary_charts in visualization.
                           # "d1": d1, "d2": d2,
                           'cbTargets': cbTargets, 'cbFeatures': cbFeatures, 'cbFilterOR': cbFilterOR,
                           'cbFilterAND': cbFilterAND, 'cbCommons': cbCommons, 'chatbot_error': errorMessage})

        return redirect(reverse('selected_data') + '?chatbotError=' + errorMessage)



    elif path == "/upload_file/":
        return redirect(reverse('upload_file') + '?chatbotError=' + errorMessage)


def getChatErrorMessage(request, errorName):
    messages = {'same_username': "The username you have given me matches the username of your current session",
                'bad_credentials': "The username and password combination you have given me is not valid",
                'passwords_not_match': "I have not been able to register the user, the two passwords you have given me do not match",
                'username_already_exists': "I have not been able to register the user, there is already a user with this name",
                'logout_no_active_session': "It is not possible to close a session that does not exist, you are not logged in...",
                'document_not_exist': "I cannot find any document with the name you have given me",
                'open_document_no_active_session': "You need to be logged in to access the documents", }
    if errorName in messages:
        return messages[errorName]
    else:
        return "An error has occurred"

def getChatSuccessMessage(request, successName):
    messages = {'best_layout': "I have selected the best visualization according to the graph characteristics"}
    return messages[successName]