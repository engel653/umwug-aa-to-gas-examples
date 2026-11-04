function pivotInstructors() {
  // Paste Folder ID below
  const folder = DriveApp.getFolderById('');
  // Paste Sheet ID below
  const sheetId = '';

  let emailsFile1 = folder.getFilesByName('Course instructors (all emails) [INST-UPLOAD-1].csv');

  if (emailsFile1.hasNext()) {
    emailsFile1 = emailsFile1.next();
  } else return;

  const emailsFile2 = folder.getFilesByName('Course instructors (all emails) [INST-UPLOAD-2].csv').next();

  const instructorsCsv = Utilities.parseCsv(
    folder.getFilesByName('Course instructors by semester [INST-UPLOAD].csv')
      .next().getBlob().getDataAsString()
  );
  const emailsCsv = Utilities.parseCsv(emailsFile1.getBlob().getDataAsString())
    .concat(Utilities.parseCsv(emailsFile2.getBlob().getDataAsString()).slice(1));

  const headers = instructorsCsv.splice(0, 1)[0];
  headers.push('Last Name', 'First Name', 'Preferred Email');

  let pivot = [];

  const emailIndex = emailsCsv.map(row => row[0]);

  console.log('Begin email search');
  for (const row of instructorsCsv) {
    row[4] = row[4].split('; ');

    for (const primaryId of row[4]) {
      const foundIndex = emailIndex.indexOf(primaryId);
      if (foundIndex == -1) continue;

      const newRow = [row[0], row[1], row[2], row[3], primaryId];
      newRow.push(...emailsCsv[foundIndex].slice(1));
      pivot.push(newRow);
    }
  }
  console.log('End email search');

  // Delete "all emails" files
  emailsFile1.setTrashed(true);
  emailsFile2.setTrashed(true);

  // Deduplicate
  const seen = new Set();
  pivot = pivot.filter(item => {
    const concat = item[1] + item[2] + item[3] + item[4];
    return seen.has(concat) ? false : seen.add(concat);
  });

  pivot.unshift(headers);

  const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
  writeToSheet(sheet, pivot);
  filterCurrentTerm(sheet);
}

function writeToSheet(sheet, data) {
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.deleteRow(1);
  sheet.clear();
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  sheet.getRange(1, 1, data.length, data[0].length).createFilter();
  
  sheet.insertRowBefore(1);
  sheet.getRange(1, 1).setValue('Alma\'s course year values for Spring and Summer match the year in which the Autumn/Fall term began, which is one less than the year values that the UMN uses for those semesters. For example, the semester from January-May 2023 is "Spring 2022" here, but "Spring 2023" at the UMN.');
  sheet.getRange(1, 1, 1, 8).merge().setWrap(true)
    .setFontColor('yellow').setBackground('gray');
}

function filterCurrentTerm(sheet) {
  const filter = sheet.getFilter();

  let semester = '';
  const curMonth = new Date().getMonth() + 1;
  if (curMonth >= 9 && curMonth <= 12) {
    semester = '9';
  } else if (curMonth >= 1 && curMonth <= 4) {
    semester = '3';
  } else if (curMonth >= 5 && curMonth <= 8) {
    semester = '5';
  }
  
  let year = new Date().getFullYear();
  year = year.toString().slice(2);

  const umnTerm = `1${year}${semester}`;
  console.log(umnTerm);

  const excludedTerms = Array.from(new Set(
    sheet.getSheetValues(3, 1, -1, 1).map(s => s[0]).filter(s => s != umnTerm)
  ));
  const termCriteria = SpreadsheetApp.newFilterCriteria()
    .setHiddenValues(excludedTerms).build();
  filter.setColumnFilterCriteria(1, termCriteria);
}
