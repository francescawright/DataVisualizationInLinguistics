# import sqlite3
# import json
#
# # Open a connection to the SQLite database file
# connection = sqlite3.connect('rasa/rasa.db')
#
# # Create a cursor to execute SQL queries
# cursor = connection.cursor()
#
# # Execute a query to retrieve user messages
# query = '''
#     SELECT JSON_EXTRACT(data, '$.event') AS event_type,
#            JSON_EXTRACT(data, '$.timestamp') AS timestamp,
#            JSON_EXTRACT(data, '$.text') AS user_text
#     FROM events
#     WHERE JSON_EXTRACT(data, '$.event') = 'user'
# '''
#
# try:
#     # Execute the query
#     cursor.execute(query)
#
#     # Fetch all user messages from the query result
#     user_messages = cursor.fetchall()
#
#     # Extract and log user messages to console
#     for message in user_messages:
#         event_type = message[0]
#         timestamp = message[1]
#         user_text = message[2]
#         print(f'Event Type: {event_type}, Timestamp: {timestamp}, User Text: {user_text}')
#
#     # Close the cursor and the database connection
#     cursor.close()
#     connection.close()
#
# except sqlite3.Error as error:
#     print("Error retrieving user messages:", error)
#
#

# import sqlite3
# import json
#
# # Open a connection to the SQLite database file
# connection = sqlite3.connect('rasa.db')
#
# # Create a cursor to execute SQL queries
# cursor = connection.cursor()
#
# # Execute a query to retrieve user messages
# query = '''
#     SELECT JSON_EXTRACT(data, '$.event') AS event_type,
#            JSON_EXTRACT(data, '$.timestamp') AS timestamp,
#            JSON_EXTRACT(data, '$.text') AS user_text
#     FROM events
#     WHERE JSON_EXTRACT(data, '$.event') = 'user'
# '''
#
# try:
#     # Execute the query
#     cursor.execute(query)
#
#     # Fetch all user messages from the query result
#     user_messages = cursor.fetchall()
#
#     # Print the number of user messages retrieved
#     print(f"Number of user messages retrieved: {len(user_messages)}")
#
#     # Extract and log user messages to console
#     for message in user_messages:
#         event_type = message[0]
#         timestamp = message[1]
#         user_text = message[2]
#         print(f'Event Type: {event_type}, Timestamp: {timestamp}, User Text: {user_text}')
#
#     # Close the cursor and the database connection
#     cursor.close()
#     connection.close()
#
# except sqlite3.Error as error:
#     print("Error retrieving user messages:", error)



#
# # Open a connection to the SQLite database file
# connection = sqlite3.connect('/rasa/rasa.db')
#
# # Create a cursor to execute SQL queries
# cursor = connection.cursor()
#
# # Execute a query to retrieve user messages
# query = "SELECT data FROM events WHERE JSON_EXTRACT(data, '$.event') = 'user'"
# cursor.execute(query)
#
# # Fetch all user messages from the query result
# user_messages = cursor.fetchall()
#
# # Extract and log user messages
# for message in user_messages:
#     data = json.loads(message[0])
#     if 'event' in data and data['event'] == 'user':
#         event_type = data.get('event')
#         timestamp = data.get('timestamp')
#         user_text = data.get('text')
#         if event_type and timestamp and user_text:
#             print('Event Type:', event_type)
#             print('Timestamp:', timestamp)
#             print('User Text:', user_text)
#             print()
#
# # Close the cursor and the database connection
# cursor.close()
# connection.close()
#

# # Open a connection to the SQLite database file
# connection = sqlite3.connect('/rasa/rasa.db')
#
# # Create a cursor to execute SQL queries
# cursor = connection.cursor()
#
# # Execute a query to retrieve user messages
# query = '''
#     SELECT JSON_EXTRACT(data, '$.event') AS event_type,
#            JSON_EXTRACT(data, '$.timestamp') AS timestamp,
#            JSON_EXTRACT(data, '$.text') AS user_text
#     FROM events
#     WHERE JSON_EXTRACT(data, '$.event') = 'user';
# '''
# cursor.execute(query)
#
# # Fetch all user messages from the query result
# user_messages = cursor.fetchall()
#
# # Extract and log user messages
# for message in user_messages:
#     event_type = json.loads(message[0])
#     timestamp = json.loads(message[1])
#     user_text = json.loads(message[2])
#
#     print(f"Event Type: {event_type}")
#     print(f"Timestamp: {timestamp}")
#     print(f"User Text: {user_text}")
#
# # Close the cursor and the database connection
# cursor.close()
# connection.close()
