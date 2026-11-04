# alma-analytics-etl-date

This Google Apps Script makes a request to the Alma Analytics API to get a report of the "Data Updated As Of" and "Data Available As Of" for the most recent data in Alma Analytics. This is used to populate an email sent to Analytics admins, which includes these dates and an emoji representing whether or not the dates correspond to what we expect them to be. This helps us notice if updated data is erroneously not yet available for the day.

## Configuration

1. Create a new standalone Google Apps Script, and copy the contents of [email-dates.js](email-dates.js) into it.
2. Create an Alma Analytics report in a shared folder. This report should be from the "Analytics Usage Tracking" subject area, containing just the two fields `"Institution"."Data Available As Of"` and `"Institution"."Data Updated As Of"`.
3. Add your API key with "Analytics - Production Read-only" permission in the string `const apiKey = ''`.
4. Add the URL-encoded path to your report (which can be copied from the URL when accessing the report in your browser) in the string `const reportPath = ''`.
5. Add recipient(s) to the array `const recipients = ['user@example.com']`.
6. Add a time-based trigger to the script, to run daily in the morning.