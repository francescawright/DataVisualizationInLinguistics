from pyexcel_xls import get_data as xls_get
from pyexcel_xlsx import get_data as xlsx_get

from DataVisualization.models import Commentary, Document
import datetime

from django.utils import timezone


excel_columns = {
    "COMMENT_ID": 0,
    "USER_ID": 1,
    "DATE": 2,
    "TIME": 3,
    "THREAD": 4,
    "COMMENT_LEVEL": 5,
    "COMMENT": 6,
    "ARGUMENTATION": 7,
    "CONSTRUCTIVITY": 8,
    "POSITIVE_STANCE": 9,
    "NEGATIVE_STANCE": 10,
    "TARGET_PERSON": 11,
    "TARGET_GROUP": 12,
    "STEREOTYPE": 13,
    "SARCASM": 14,
    "MOCKERY": 15,
    "INSULT": 16,
    "IMPROPER_LANGUAGE": 17,
    "AGGRESSIVENESS": 18,
    "INTOLERANCE": 19,
    "TOXICITY": 20,
    "TOXICITY_LEVEL": 21
}


class ExcelParser:
    def load_and_parse(self, excel_file):
        data = self.parse(excel_file, self.get_parse_function(excel_file))
        for sheet in data.keys():
            for row in data[sheet][1:]:
                try:
                    Commentary.objects.create(
                        document_id=excel_file,
                        document_name=excel_file.document.name,
                        comment_id=row[excel_columns["COMMENT_ID"]],
                        user_id=row[excel_columns["USER_ID"]],
                        date=datetime.datetime.combine(row[excel_columns["DATE"]], row[excel_columns["TIME"]],
                                                       tzinfo=timezone.utc),
                        thread=row[excel_columns["THREAD"]],
                        comment_level=row[excel_columns["COMMENT_LEVEL"]],
                        comment=row[excel_columns["COMMENT"]],
                        argumentation=row[excel_columns["ARGUMENTATION"]],
                        constructivity=row[excel_columns["CONSTRUCTIVITY"]],
                        positive_stance=row[excel_columns["POSITIVE_STANCE"]],
                        negative_stance=row[excel_columns["NEGATIVE_STANCE"]],
                        target_person=row[excel_columns["TARGET_PERSON"]],
                        target_group=row[excel_columns["TARGET_GROUP"]],
                        stereotype=row[excel_columns["STEREOTYPE"]],
                        sarcasm=row[excel_columns["SARCASM"]],
                        mockery=row[excel_columns["MOCKERY"]],
                        insult=row[excel_columns["INSULT"]],
                        improper_language=row[excel_columns["IMPROPER_LANGUAGE"]],
                        aggressiveness=row[excel_columns["AGGRESSIVENESS"]],
                        intolerance=row[excel_columns["INTOLERANCE"]],
                        toxicity=row[excel_columns["TOXICITY"]],
                        toxicity_level=row[excel_columns["TOXICITY_LEVEL"]]
                    )
                except IndexError:
                    continue

    def drop_database(self):
        Commentary.objects.all().delete()

    def is_xls(self, excel_file):
        return str(excel_file.document.name).split('.')[-1] == 'xls'

    def is_xlsx(self, excel_file):
        return str(excel_file.document.name).split('.')[-1] == 'xlsx'

    def get_parse_function(self, excel_file):
        if self.is_xls(excel_file):
            return xls_get
        elif self.is_xlsx(excel_file):
            return xlsx_get
        else:
            raise Exception("File not supported.")

    def parse(self, excel_file, parse_function, column_limit=22):
        return parse_function(excel_file.document.name, column_limit=column_limit)
