import logging

DJANGO_DB_LOGGER_ENABLE_FORMATTER = False

db_default_formatter = logging.Formatter()


class DatabaseLogHandler(logging.Handler):
    def emit(self, record):
        from .models import StatusLog
        
        trace = None

        if record.exc_info:
            trace = db_default_formatter.formatException(record.exc_info)

        if DJANGO_DB_LOGGER_ENABLE_FORMATTER:
            msg = self.format(record)
        else:
            msg = record.getMessage()

        if hasattr(record,'user'):
            user = record.user
        else:
            user = ''

        if hasattr(record,'session_id'):
            session_id = record.session_id
        else:
            session_id = None

        if hasattr(record,'sender'):
            sender = record.sender
        else:
            sender = ''

        if hasattr(record,'is_action'):
            is_action = record.is_action
        else:
            is_action = None

        kwargs = {
            'logger_name': record.name,
            'level': record.levelno,
            'msg': msg,
            'trace': trace,
            'sender': record.sender,
            'is_action': record.is_action,
            'user': record.user,
            'session_id': record.session_id,
        }

        StatusLog.objects.create(**kwargs)

    def format(self, record):
        if self.formatter:
            fmt = self.formatter
        else:
            fmt = db_default_formatter

        if type(fmt) == logging.Formatter:
            record.message = record.getMessage()

            if fmt.usesTime():
                record.asctime = fmt.formatTime(record, fmt.datefmt)

            # ignore exception traceback and stack info

            return fmt.formatMessage(record)
        else:
            return fmt.format(record)
