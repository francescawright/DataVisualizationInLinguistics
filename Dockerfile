FROM python:3.7
ENV PYTHONUNBUFFERED=1
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r requirements.txt
COPY . /code/
ADD credentials.yml credentials.yml
ADD endpoints.yml endpoints.yml
ADD config.yml config.yml
ADD domain.yml domain.yml