# course-instructor-list

These scripts upload and manipulate data from scheduled Alma Analytics reports, to create a regularly updated list of recent UMN course instructors from the last two years (as defined by the course reserves data in Alma) and their email addresses. This list is used by course reserves staff to communicate with instructors. They also update a list of recent UMN courses from the last two years that have been loaded into Alma. This list is used by course reserves staff and UMN Bookstore staff.

## Alma Analytics setup

Four Alma Analytics reports are scheduled daily at 5 a.m., titled:

* Course instructors by semester [INST-UPLOAD]
* Course instructors (all emails) [INST-UPLOAD-1]
* Course instructors (all emails) [INST-UPLOAD-2]
* Courses by semester [INST-UPLOAD]

The "all emails" reports come from a different subject area than the list of instructors in the course reserves subject area, which does not include contact information or names in a way that can be linked to the concatenated primary IDs. These reports necessarily pull email addresses of all potential instructors (broader than the final spreadsheet), but they are deleted immediately after they are matched by the script.

These reports are sent as email attachments and filtered out of the inbox, into the "Course instructors" label, with the filter: `from:(libnotic@umn.edu) subject:("[INST-UPLOAD") "Attached please find the following Analytics report to which you are subscribed"` → `Skip Inbox, Apply label "Course instructors"`.

## Google Apps Script setup

### Script config

* [upload-instructors.js](./upload-instructors.js):
  * Add folder ID of where the reports will be saved to string `const folder = DriveApp.getFolderById('')`.
* [pivot-instructors.js](./pivot-instructors.js):
  * Add folder ID of where the reports will be saved to string `const folder = DriveApp.getFolderById('')`.
  * Add Sheet ID of your instructors report to string `const sheetId = ''`.
* [update-courses.js](./update-courses.js):
  * Add folder ID of where the reports will be saved to string `const folder = DriveApp.getFolderById('')`.
  * Add Sheet ID of your courses report to string `const sheetId = ''`.

### Triggers

* [upload-instructors.js](./upload-instructors.js) runs as a Google Apps Script, with a daily trigger: `Time-driven > Day timer > 6am to 7am`. This must run before the pivot and update scripts.
* [pivot-instructors.js](./pivot-instructors.js) runs as a Google Apps Script, with a weekly trigger: `Time-driven > Day timer > 7am to 8am`.
* [update-courses.js](./update-courses.js) runs as a Google Apps Script, with a weekly trigger: `Time-driven > Day timer > 7am to 8am`.
