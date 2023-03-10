import json
import os
import datetime

from datetime import datetime
import json

from rasa.core.tracker_store import SQLTrackerStore

from rasa.core.tracker_store import SQLTrackerStore
from rasa.core.tracker_store import ConversationMessage


class CustomTrackerStore(SQLTrackerStore):
    def save(self, tracker):
        # retrieve the user ID and events from the tracker
        user_id = tracker.sender_id
        events = tracker.events

        # filter out all events except for user and bot messages
        messages = []
        for event in events:
            if event["event"] == "user":
                message = {
                    "timestamp": event["timestamp"],
                    "user_id": user_id,
                    "text": event["text"],
                    "intent": event["parse_data"]["intent"]["name"],
                    "entities": event["parse_data"]["entities"],
                }
                messages.append(message)
            elif event["event"] == "bot":
                message = {
                    "timestamp": event["timestamp"],
                    "user_id": user_id,
                    "text": event["text"],
                }
                messages.append(message)

        # store the messages in the database
        if messages:
            self.conversation_session.add_all(
                [ConversationMessage(**m) for m in messages]
            )
            self.conversation_session.commit()


# tracker_store = SQLTrackerStore(
#     dialect="sqlite",
#     url="sqlite:///./rasa.db",
#     db="rasa_tracker",
# )
#
# def write_conversation(tracker):
#     # get username from tracker
#     username = tracker.sender_id
#
#     # get latest user message and bot message from tracker
#     latest_user_message = tracker.latest_message.get('text')
#     latest_bot_message = None
#     for event in reversed(tracker.events):
#         if event.get('event') == 'bot':
#             latest_bot_message = event.get('text')
#             break
#
#     # create filename with username
#     filename = f'{username}.json'
#
#     # create conversation object
#     conversation = {
#         'timestamp': str(datetime.now()),
#         'user_message': latest_user_message,
#         'bot_message': latest_bot_message
#     }
#
#     # write conversation to file
#     with open(filename, 'a') as f:
#         json.dump(conversation, f)
#         f.write('\n')  # add newline character for readability
#
#     # save conversation to database
#     tracker_store.save(tracker)


# def save_chat_log(username, message, bot_messages):
#     # Generate timestamp in the format "YYYY-MM-DD-HH-MM-SS"
#     timestamp = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
#
#     # Create the logs directory if it doesn't already exist
#     logs_dir = "logs"
#     if not os.path.exists(logs_dir):
#         os.makedirs(logs_dir)
#
#     # Create the user's log file if it doesn't already exist
#     log_file = os.path.join(logs_dir, f"{username}.txt")
#     if not os.path.exists(log_file):
#         with open(log_file, "w") as f:
#             f.write(f"Conversation logs for {username}\n")
#
#     # Append the message to the user's log file
#     with open(log_file, "a") as f:
#         f.write(f"{timestamp} - User: {message}\n")
#         for bot_message in bot_messages:
#             f.write(f"{timestamp} - Bot: {bot_message}\n")
# from rasa.core.tracker_store import TrackerStore
#
#
# def write_conversation(tracker):
#     # get username from tracker
#     username = tracker.sender_id
#
#     # get latest user message and bot message from tracker
#     latest_user_message = tracker.latest_message.get('text')
#     latest_bot_message = None
#     for event in reversed(tracker.events):
#         if event.get('event') == 'bot':
#             latest_bot_message = event.get('text')
#             break
#
#     # create filename with username
#     filename = f'{username}.json'
#
#     # create conversation object
#     conversation = {
#         'timestamp': str(datetime.now()),
#         'user_message': latest_user_message,
#         'bot_message': latest_bot_message
#     }
#
#     # write conversation to file
#     with open(filename, 'a') as f:
#         json.dump(conversation, f)
#         f.write('\n')  # add newline character for readability
#
#     # save conversation to database
#     tracker_store = TrackerStore(database=tracker_store)
#     tracker_store.save(tracker)
