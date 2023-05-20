FROM python:3.7

ENV PYTHONUNBUFFERED=1

# Install SQLite
RUN apt-get update && apt-get install -y sqlite3

WORKDIR /code

COPY requirements.txt /code/
RUN pip install -r requirements.txt

COPY . /code/

ADD rasa/credentials.yml credentials.yml
ADD rasa/endpoints.yml endpoints.yml
ADD rasa/config.yml config.yml
ADD rasa/domain.yml domain.yml

CMD ["sqlite3", "/data/rasa.db"]
