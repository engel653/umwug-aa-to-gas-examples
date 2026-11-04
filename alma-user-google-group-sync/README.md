# alma-user-google-group-sync

This Google Apps Script compares an Alma Analytics report of Alma users with staff roles to the users in an "Alma Users" Google Group. This allows us to keep the Google Group in sync as staff are added to or removed from Alma.

## Setup

Create an Alma Analytics report that lists all users in employee user groups with roles other than "patron" or "instructor," providing a list of all staff that use Alma. Save it in a shared folder with a title ending in `[ALMA-USERS-LIST]`.

This report should be scheduled to be sent as a CSV file weekly to the email address that will run the script, **which must be a member of the Google Group with permission to view its members**. It is filtered out of the inbox, into the "Alma users" label, with the filter: `subject:("[ALMA-USERS-LIST") "Attached please find the following Analytics report to which you are subscribed"` → `Skip Inbox, Apply label "Alma users"`. Do not open these emails, as the script relies on the emails being unread.

[compare-group-users.js](compare-group-users.js) runs as a Google Apps Script, with a weekly trigger for the hour after the Alma Analytics report is scheduled. Make the following changes to the script:

1. Add Google Group email address to string `const groupEmail = ''`.
2. Add email from which the script is running to string `const accountEmail = ''`.
3. Add recipient to string `to: 'user@example.com'`.

## Email sent

The layout and headings in the email will change depending on the results. There are two possible sections: "Users with employee Alma roles but not in Google Group," and "Users in Google Group but without employee Alma roles." If there aren't users in either category, it will send "There are no current issues with group membership." It is intended that someone will monitor this email and makes necessary changes to the Google Group.