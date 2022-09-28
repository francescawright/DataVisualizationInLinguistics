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
#         return "store_session_slots"
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

        requests.get(domainUrl + "selected_data/", params={"csrfmiddlewaretoken":tracker.get_slot("csrfmiddlewaretoken")},
                     cookies={"sessionid":tracker.get_slot("sessionid"),"csrftoken":tracker.get_slot("csrftoken")})

        if (tracker.get_slot("sessionid")):
            print("yes sessionid")
        else:
            print("no sessionid")
        if (requests): # successful response
            dispatcher.utter_message(text="The session has been successfully closed")
        else:
            dispatcher.utter_message(text="An error has occurred")

        return []