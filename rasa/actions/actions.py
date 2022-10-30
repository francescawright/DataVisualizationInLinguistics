# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List

from rasa_sdk.events import SlotSet, FollowupAction
from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.types import DomainDict

import re
import requests
import random

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

# class ActionLogout(Action):
#
#     def name(self) -> Text:
#         return "action_logout"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         if (tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None"):
#             response = requests.get(domainUrl + "logout/", params={"csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken")},
#                          cookies={"sessionid": tracker.get_slot("sessionid"),
#                                   "csrftoken": tracker.get_slot("csrftoken")})
#         else:
#             dispatcher.utter_message(
#                 text="It is not possible to close a session that does not exist, you are not logged in...")
#             return []
#
#         if (response):  # successful response
#             dispatcher.utter_message(text="intent_logout")
#             return [SlotSet("sessionid", None)]
#         else:
#             dispatcher.utter_message(text="An error has occurred")
#             return []

class ActionLogout(Action):

    def name(self) -> Text:
        return "action_logout"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="intent_logout")
        return [SlotSet("sessionid", None)]


class ActionCheckSessionLogin(Action):

    def name(self) -> Text:
        return "action_check_session_login"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if tracker.get_slot("user_is_logged_in"):
            return [FollowupAction("utter_logout_to_login")]
        else:
            return [FollowupAction("login_form")]


class ActionCheckSessionSignup(Action):

    def name(self) -> Text:
        return "action_check_session_signup"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if tracker.get_slot("user_is_logged_in"):
            return [FollowupAction("utter_logout_to_signup")]
        else:
            return [FollowupAction("signup_form")]


class ActionLogoutToLoginCancellation(Action):

    def name(self) -> Text:
        return "action_logout_to_login_cancellation"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="I will keep your current session open")
        return [SlotSet("username", None), SlotSet("password", None)]


class ActionLogoutToSignupCancellation(Action):

    def name(self) -> Text:
        return "action_logout_to_signup_cancellation"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="Okey! I will not log you out")
        return [SlotSet("username", None), SlotSet("password", None), SlotSet("password_confirmation", None)]


# class ActionLogin(Action):
#
#     def name(self) -> Text:
#         return "action_login"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         if (tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None"):
#             dispatcher.utter_message(
#                 text="You are already logged in, do you want me to log you out to start a new session?")
#             # return [SlotSet("new_session", True)]
#             return []
#         else:
#             key = b'ZeuY3kEaYn2XkyPQPQKgDmDeDRJfKYM3-tTx_5NmMm4='
#             response = requests.post(domainUrl + "login/", data={"rasaserver": "true",
#                     "csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken"),
#                     "username": encrypt(tracker.get_slot("username").encode(), key).decode(),
#                     "password": encrypt(tracker.get_slot("password").encode(), key).decode()},
#                     cookies={"csrftoken": tracker.get_slot("csrftoken")})
#
#         if (response):  # successful response
#             dispatcher.utter_message(text='intent_login,' + encrypt(tracker.get_slot("username").encode(), key).decode() + ',' + encrypt(tracker.get_slot("password").encode(), key).decode())
#             return []
#         else:
#             dispatcher.utter_message(text="An error has occurred")
#             return [SlotSet("sessionid", None)]
#
#
# class ActionNewSession(Action):
#
#     def name(self) -> Text:
#         return "action_new_login"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         if (tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None"):
#             response = requests.get(domainUrl + "logout/", params={"csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken")},
#                          cookies={"sessionid": tracker.get_slot("sessionid"),
#                                   "csrftoken": tracker.get_slot("csrftoken")})
#         else:
#             dispatcher.utter_message(
#                 text="I have lost the previous session, but you can start a new session anyway.")
#
#         if (response):  # successful response
#             dispatcher.utter_message(text="intent_logout")
#         else:
#             dispatcher.utter_message(text="An error has occurred")
#
#         return [SlotSet("new_session", False)]
#
# class ActionSignup(Action):
#
#     def name(self) -> Text:
#         return "action_signup"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         if (tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None"):
#             dispatcher.utter_message(
#                 text="You are logged in, do you want me to log you out so you can register as another user?")
#             # return [SlotSet("new_session", True)]
#             return []
#         else:
#             key = b'JlgbJKpxVhwF3NXJf_n-lt4c4AvdCATnuXYDK4xivPY='
#             response = requests.post(domainUrl + "signup/", data={"rasaserver": "true",
#                         "csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken"),
#                         "username": encrypt(tracker.get_slot("username").encode(), key).decode(),
#                         "password1": encrypt(tracker.get_slot("password").encode(), key).decode(),
#                         "password2": encrypt(tracker.get_slot("password_confirmation").encode(), key).decode()},
#                         cookies={"csrftoken": tracker.get_slot("csrftoken")})
#
#         if (response):  # successful response
#             dispatcher.utter_message(text='intent_signup,' + encrypt(tracker.get_slot("username").encode(), key).decode()
#                                           + ',' + encrypt(tracker.get_slot("password").encode(), key).decode()
#                                           + ',' + encrypt(tracker.get_slot("password_confirmation").encode(), key).decode())
#             return []
#         else:
#             dispatcher.utter_message(text="An error has occurred")
#             return [SlotSet("sessionid", None)]

class ActionLogin(Action):

    def name(self) -> Text:
        return "action_login"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        key = b'ZeuY3kEaYn2XkyPQPQKgDmDeDRJfKYM3-tTx_5NmMm4='
        dispatcher.utter_message(
            text='intent_login,' + encrypt(tracker.get_slot("username").encode(), key).decode() + ',' + encrypt(
                tracker.get_slot("password").encode(), key).decode())
        return [SlotSet("username", None), SlotSet("password", None)]


class ActionSignup(Action):

    def name(self) -> Text:
        return "action_signup"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        key = b'JlgbJKpxVhwF3NXJf_n-lt4c4AvdCATnuXYDK4xivPY='
        dispatcher.utter_message(text='intent_signup,' + encrypt(tracker.get_slot("username").encode(), key).decode()
                                      + ',' + encrypt(tracker.get_slot("password").encode(), key).decode()
                                      + ',' + encrypt(tracker.get_slot("password_confirmation").encode(), key).decode())
        return [SlotSet("username", None), SlotSet("password", None), SlotSet("password_confirmation", None)]


class ValidateSignupForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_signup_form"

    def validate_username(self,
                          slot_value: Any,
                          dispatcher: CollectingDispatcher,
                          tracker: Tracker,
                          domain: DomainDict,
                          ) -> Dict[Text, Any]:
        """Validate username value."""

        # make a pattern
        pattern = "^[A-Za-z0-9@.+-_]*$"

        if len(slot_value) > 150:
            dispatcher.utter_message(
                text="Ensure this value has at most 150 characters (it has " + str(len(slot_value)) + ")")
        elif not re.match(pattern, slot_value):
            dispatcher.utter_message(
                text="Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.")
        else:
            # validation succeeded, set the value of the "username" slot to value
            return {"username": slot_value}

        # validation failed, set this slot to None so that the
        # user will be asked for the slot again
        return {"username": None}

    @staticmethod
    def common_passwords_db() -> List[Text]:
        """Database of common passwords"""

        return ["12345", "123456", "1234567", "12345678", "123456789", "qwerty", "password", "123123", "123123123",
                "1234567890", "qwerty123", "password1", "football", "monkey", "baseball", "dragon"]

    def validate_password(self,
                          slot_value: Any,
                          dispatcher: CollectingDispatcher,
                          tracker: Tracker,
                          domain: DomainDict,
                          ) -> Dict[Text, Any]:
        """Validate password value."""

        succeed = True

        if slot_value == tracker.get_slot("username"):
            dispatcher.utter_message(text="The password is too similar to the username.")
            succeed = False
        if len(slot_value) < 8:
            dispatcher.utter_message(text="This password is too short. It must contain at least 8 characters.")
            succeed = False
        # Check if the password is within a dictionary of common passwords
        # or if the password consists of the same character repeated multiple times
        if slot_value.lower() in self.common_passwords_db() or slot_value.lower() == len(slot_value) * slot_value[
            0].lower():
            dispatcher.utter_message(text="This password is too common.")
            succeed = False
        if slot_value.isdigit():
            dispatcher.utter_message(text="This password is entirely numeric.")
            succeed = False
        if succeed:
            # validation succeeded, set the value of the "password" slot to value
            return {"password": slot_value}
        else:
            # validation failed, set this slot to None so that the
            # user will be asked for the slot again
            return {"password": None}


def clean_name(name):
    return ''.join([c for c in name.split(' ', 1)[0] if c.isalpha()])


class ValidateNicknameForm(FormValidationAction):

    def name(self) -> Text:
        return "validate_nickname_form"

    def validate_nickname(self,
                          slot_value: Any,
                          dispatcher: CollectingDispatcher,
                          tracker: Tracker,
                          domain: DomainDict,
                          ) -> Dict[Text, Any]:
        """Validate username value."""

        name = clean_name(slot_value)
        if len(name) == 0:
            dispatcher.utter_message(text="That must've been a typo")
            return {"nickname": None}
        return {"nickname": name}


class ActionOpenDocument(Action):

    def name(self) -> Text:
        return "action_open_document"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        document_requested_value = tracker.get_slot("document_requested")

        for e in tracker.latest_message['entities']:
            if e['entity'] == 'document_requested':
                document_requested_value = e['value']

        dispatcher.utter_message(text='intent_open_document,' + document_requested_value)
        return [SlotSet("document_requested", None)]


class ActionGreet(Action):

    def name(self) -> Text:
        return "action_greet"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        nickname_value = None
        first_login_value = None
        greet_again_value = None
        for e in tracker.latest_message['entities']:
            if e['entity'] == 'nickname':
                nickname_value = e['value']
            elif e['entity'] == 'first_login':
                first_login_value = e['value'] == "True"
            elif e['entity'] == 'greet_again':
                greet_again_value = e['value'] == "True"

        if tracker.get_slot("sessionid") and tracker.get_slot("sessionid") != "None":
            if nickname_value:
                messages = ["Hey, " + nickname_value + ". Nice to see you again! 😄",
                            "Hi, " + nickname_value + ". How are you? 😄",
                            "Hello, " + nickname_value + ". I'm here if you need me 😄"] if not greet_again_value else \
                        ["Hey, " + nickname_value + ". How else can I help you? 😉",
                         "Hi, " + nickname_value + ". What else can I do for you? 😉"]
                dispatcher.utter_message(text=random.choice(messages))
                return [SlotSet("nickname", nickname_value), SlotSet("first_login", first_login_value),
                        SlotSet("user_is_logged_in", True)]
            else:
                messages = ["Hey! Nice to see you here 😄", "Hello! I'm here if you need me 😄", "Hi, how are you? 😄",
                            "Hello there 😄"] if not greet_again_value else ["How else can I help you? 😉", "What else can I do for you? 😉"]
                dispatcher.utter_message(text=random.choice(messages))

            if first_login_value:
                return [FollowupAction("nickname_form"), SlotSet("nickname", nickname_value),
                        SlotSet("first_login", True), SlotSet("user_is_logged_in", True)]
            else:
                return [SlotSet("nickname", nickname_value), SlotSet("first_login", False),
                        SlotSet("user_is_logged_in", True)]

        # If the user is not logged in or does not have a nickname
        messages = ["Hey! Nice to see you here 😄", "Hello! I'm here if you need me 😄", "Hi, how are you? 😄",
                    "Hello there 😄"] if not greet_again_value else \
            ["How else can I help you? 😉", "What else can I do for you? 😉"]

        dispatcher.utter_message(text=random.choice(messages))
        return [SlotSet("nickname", nickname_value), SlotSet("first_login", first_login_value),
                SlotSet("user_is_logged_in", False)]


class ActionRememberNickname(Action):

    def name(self) -> Text:
        return "action_remember_nickname"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        nickname_value = tracker.get_slot("nickname")

        for e in tracker.latest_message['entities']:
            if e['entity'] == 'nickname':
                nickname_value = e['value']

        if tracker.get_slot("user_is_logged_in"):
            response_nickname = requests.post(domainUrl + "save_nickname/",
                                              data={"csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken"),
                                                    "nickname": nickname_value},
                                              cookies={"sessionid": tracker.get_slot("sessionid"),
                                                       "csrftoken": tracker.get_slot("csrftoken")})

            if (tracker.get_slot("first_login") == True):
                # Save in the database that the user has made his first chat connection
                response_firstchat = requests.post(domainUrl + "save_first_login/",
                                                   data={"csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken"),
                                                         "first_login": False},
                                                   cookies={"sessionid": tracker.get_slot("sessionid"),
                                                            "csrftoken": tracker.get_slot("csrftoken")})
            else:
                response_firstchat = True

        else:
            dispatcher.utter_message(text="I have lost your session, please log in again.")
            return []

        if response_nickname and response_firstchat:  # successful response
            dispatcher.utter_message(text="Okay " + nickname_value + ", I'll remember it!")
            return [SlotSet("nickname", nickname_value), SlotSet("first_login", False)]
        else:
            dispatcher.utter_message(text="An error has occurred")
            return []


class ActionRefusedNickname(Action):

    def name(self) -> Text:
        return "action_refused_nickname"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Save in the database that the user has made his first chat connection

        if tracker.get_slot("user_is_logged_in"):
            # Save in the database that the user has made his first chat connection
            response_firstchat = requests.post(domainUrl + "save_first_login/",
                                               data={"csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken"),
                                                     "first_login": False},
                                               cookies={"sessionid": tracker.get_slot("sessionid"),
                                                        "csrftoken": tracker.get_slot("csrftoken")})
        else:
            dispatcher.utter_message(text="I have lost your session, please log in again.")
            return []

        if response_firstchat:  # successful response
            dispatcher.utter_message(text="All right, anyway, remember you can tell me at any time")
            return [SlotSet("first_login", False)]
        else:
            dispatcher.utter_message(text="An error has occurred")
            return []

class ActionForgetName(Action):

    def name(self) -> Text:
        return "action_forget_name"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        if tracker.get_slot("user_is_logged_in"):
            response_nickname = requests.post(domainUrl + "save_nickname/",
                                              data={"csrfmiddlewaretoken": tracker.get_slot("csrfmiddlewaretoken"),
                                                    "nickname": ""},
                                              cookies={"sessionid": tracker.get_slot("sessionid"),
                                                       "csrftoken": tracker.get_slot("csrftoken")})

        else:
            dispatcher.utter_message(text="Log in before if you want me to forget your name")
            return []

        if response_nickname:  # successful response
            dispatcher.utter_message(text="What name?")
            return [SlotSet("nickname", None)]
        else:
            dispatcher.utter_message(text="An error has occurred")
            return []


class ActionEmptySlotName(Action):

    def name(self) -> Text:
        return "action_empty_slot_name"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        return [SlotSet("nickname", None)]


class ActionGenerateResponseMessage(Action):

    def name(self) -> Text:
        return "action_generate_response_message"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text=tracker.latest_message['entities'][0]['value'])
        return []
