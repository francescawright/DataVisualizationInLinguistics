from django.contrib import admin
from DataVisualization.models import Document, Commentary, ChatProfile

from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin

# Register your models here.
admin.site.register(Document)
admin.site.register(Commentary)

class ChatProfileInline(admin.StackedInline):
    model = ChatProfile
    can_delete = False

class AccountsUserAdmin(AuthUserAdmin):
    def add_view(self, *args, **kwargs):
        # If you want to display the ChatProfile fields when adding a new user from the Backend
        # self.inlines =[ChatProfileInline]
        self.inlines =[]
        return super(AccountsUserAdmin, self).add_view(*args, **kwargs)

    def change_view(self, *args, **kwargs):
        self.inlines =[ChatProfileInline]
        return super(AccountsUserAdmin, self).change_view(*args, **kwargs)


admin.site.unregister(User)
admin.site.register(User, AccountsUserAdmin)