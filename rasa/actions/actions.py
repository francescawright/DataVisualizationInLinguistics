# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List

from rasa_sdk.events import SlotSet
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

import requests

domainUrl = "http://localhost:8000/"
from cryptography.fernet import Fernet


def encrypt(message: bytes, key: bytes) -> bytes:
    return Fernet(key).encrypt(message)


def decrypt(token: bytes, key: bytes) -> bytes:
    return Fernet(key).decrypt(token)


class ActionHelloWorld(Action):

    def name(self) -> Text:
        return "action_hello_world"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="Hello World!")

        return []


# class storeSessionSlots(Action):
#
#     def name(self) -> Text:
#         return "action_store_session_slots"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         print(tracker.latest_message['entities'])
#
#         return [SlotSet("csrftoken", "text2"),SlotSet("csrfmiddlewaretoken", "text3")]

class ActionLogout(Action):

    def name(self) -> Text:
        return "action_logout"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if (tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None"):
            response = requests.get(domainUrl + "logout/", params={"csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken")},
                         cookies={"sessionid": tracker.get_slot("sessionid"),
                                  "csrftoken": tracker.get_slot("csrftoken")})
        else:
            dispatcher.utter_message(
                text="It is not possible to close a session that does not exist, you are not logged in...")
            return []

        if (response):  # successful response
            dispatcher.utter_message(text="intent_logout")
            return [SlotSet("csrftoken", None), SlotSet("csrfmiddlewaretoken", None), SlotSet("sessionid", None)]
        else:
            dispatcher.utter_message(text="An error has occurred")
            return []


class ActionLogin(Action):

    def name(self) -> Text:
        return "action_login"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if (tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None"):
            dispatcher.utter_message(
                text="You are already logged in, do you want me to log you out to start a new session?")
            # return [SlotSet("new_session", True)]
            return []
        else:
            key = b'ZeuY3kEaYn2XkyPQPQKgDmDeDRJfKYM3-tTx_5NmMm4='
            response = requests.post(domainUrl + "login/", data={"rasaserver": "true",
                    "csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken"),
                    "username": encrypt(tracker.get_slot("username").encode(), key).decode(),
                    "password": encrypt(tracker.get_slot("password").encode(), key).decode()},
                    cookies={"csrftoken": tracker.get_slot("csrftoken")})

        if (response):  # successful response
            dispatcher.utter_message(text='intent_login,' + encrypt(tracker.get_slot("username").encode(), key).decode() + ',' + encrypt(tracker.get_slot("password").encode(), key).decode())
            return []
        else:
            dispatcher.utter_message(text="An error has occurred")
            return [SlotSet("csrftoken", None), SlotSet("csrfmiddlewaretoken", None), SlotSet("sessionid", None)]


class ActionNewSession(Action):

    def name(self) -> Text:
        return "action_new_login"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if (tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None"):
            response = requests.get(domainUrl + "logout/", params={"csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken")},
                         cookies={"sessionid": tracker.get_slot("sessionid"),
                                  "csrftoken": tracker.get_slot("csrftoken")})
        else:
            dispatcher.utter_message(
                text="I have lost the previous session, but you can start a new session anyway.")

        if (response):  # successful response
            dispatcher.utter_message(text="intent_logout")
        else:
            dispatcher.utter_message(text="An error has occurred")

        return [SlotSet("new_session", False)]

class ActionSignup(Action):

    def name(self) -> Text:
        return "action_signup"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if (tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None"):
            dispatcher.utter_message(
                text="You are logged in, do you want me to log you out so you can register as another user?")
            # return [SlotSet("new_session", True)]
            return []
        else:
            key = b'JlgbJKpxVhwF3NXJf_n-lt4c4AvdCATnuXYDK4xivPY='
            response = requests.post(domainUrl + "signup/", data={"rasaserver": "true",
                        "csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken"),
                        "username": encrypt(tracker.get_slot("username").encode(), key).decode(),
                        "password1": encrypt(tracker.get_slot("password").encode(), key).decode(),
                        "password2": encrypt(tracker.get_slot("password_confirmation").encode(), key).decode()},
                        cookies={"csrftoken": tracker.get_slot("csrftoken")})

        if (response):  # successful response
            dispatcher.utter_message(text='intent_signup,' + encrypt(tracker.get_slot("username").encode(), key).decode()
                                          + ',' + encrypt(tracker.get_slot("password").encode(), key).decode()
                                          + ',' + encrypt(tracker.get_slot("password_confirmation").encode(), key).decode())
            return []
        else:
            dispatcher.utter_message(text="An error has occurred")
            return [SlotSet("csrftoken", None), SlotSet("csrfmiddlewaretoken", None), SlotSet("sessionid", None)]

class ActionChangeLayout(Action):

    def name(self) -> Text:
        return "action_change_layout"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:



            return []


class ActionOpenDocument(Action):

    def name(self) -> Text:
        return "action_open_document"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:



            return []