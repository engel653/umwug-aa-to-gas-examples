function updateCourses() {
  // Paste Folder ID below
  const folder = DriveApp.getFolderById('');
  // Paste Sheet ID below
  const sheetId = '';

  let coursesFile = folder.getFilesByName('Courses by semester [INST-UPLOAD].csv');

  if (coursesFile.hasNext()) {
    coursesFile = coursesFile.next();
  } else return;

  const coursesCsv = Utilities.parseCsv(coursesFile.getBlob().getDataAsString());

  const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
  writeToSheet(sheet, coursesCsv);
  filterCurrentSemester(sheet);
}

function writeToSheet(sheet, data) {
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.deleteRow(1);
  sheet.clear();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('@');
  sheet.getRange(1, 14, sheet.getMaxRows(), 1).setNumberFormat('0');
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  sheet.getRange(1, 1, data.length, data[0].length).createFilter();
  
  sheet.insertRowBefore(1);
  sheet.getRange(1, 1).setValue('Alma\'s course year values for Spring and Summer match the year in which the Autumn/Fall term began, which is one less than the year values that the UMN uses for those semesters. For example, the semester from January-May 2023 is "Spring 2022" here, but "Spring 2023" at the UMN.');
  sheet.getRange(1, 1, 1, 7).merge().setWrap(true)
    .setFontColor('yellow').setBackground('gray');
  sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .setFontColor('yellow').setBackground('gray');
}

function filterCurrentSemester(sheet) {
  const filter = sheet.getFilter();
  filter.sort(1, false);
}
