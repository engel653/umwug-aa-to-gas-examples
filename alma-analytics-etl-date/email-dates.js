function emailDates() {
  // API key with "Analytics - Production Read/write" permission
  const apiKey = '';
  // Report path in URL encoding; can be copied from URL when accessing a report in Alma Analytics
  const reportPath = '';
  const apiPath = 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/analytics/reports';
  const url = `${apiPath}?path=${reportPath}&limit=25&col_names=true&apikey=${apiKey}`;

  // Get namespaces to parse XML
  const nsRowset = XmlService.getNamespace('urn:schemas-microsoft-com:xml-analysis:rowset');
  const nsXsd = XmlService.getNamespace('http://www.w3.org/2001/XMLSchema');
  const nsSql = XmlService.getNamespace('urn:saw-sql');

  const document = XmlService.parse(getData(url));
  const resultXml = document.getRootElement()
    .getChild('QueryResult')
    .getChild('ResultXml');
  
  let colHeadings = resultXml.getChild('rowset', nsRowset)
    .getChild('schema', nsXsd)
    .getChild('complexType', nsXsd)
    .getChild('sequence', nsXsd)
    .getChildren('element', nsXsd);
  colHeadings = colHeadings.map(el => {
    return [
      el.getAttribute('name').getValue(),
      el.getAttribute('columnHeading', nsSql).getValue()
    ];
  });

  let rows = resultXml.getChild('rowset', nsRowset)
    .getChildren('Row', nsRowset);
  rows = rows.map(row => {
    return row.getChildren().map(el => {
      return [el.getName(), el.getText()];
    });
  });

  let dateUpdated = getCol('Data Updated As Of', colHeadings, rows)[0];
  let dateAvailable = getCol('Data Available As Of', colHeadings, rows)[0];

  dateUpdated = new Date(dateUpdated);
  dateAvailable = new Date(dateAvailable);

  // Cutoff for data updated later than yesterday at 6pm
  const updatedCutoff = new Date();
  updatedCutoff.setDate(updatedCutoff.getDate() - 1);
  updatedCutoff.setHours(18, 0, 0, 0);
  // Cutoff for data available earlier than today at 5am
  const availableCutoff = new Date();
  availableCutoff.setHours(5, 0, 0, 0);

  let body = '<h1>Alma Analytics ETL dates</h1>';
  body += `<p><b>Data updated:</b> ${dateUpdated} ${dateUpdated > updatedCutoff ? "✅" : "⚠️"}</p>`;
  body += `<p><b>Data available:</b> ${dateAvailable} ${dateAvailable < availableCutoff ? "✅" : "⚠️"}</p>`;
  
  // Add recipient email(s)
  const recipients = ['user@example.com'];
  for (const recipient of recipients) {
    MailApp.sendEmail({
      to: recipient,
      subject: 'Alma Analytics ETL dates',
      htmlBody: body
    });
  }

  function getCol(heading, headings, rows) {
    const colName = headings.find(col => {
      return col[1] === heading;
    })[0];

    const vals = rows.map(row => {
      return row.find(col => {
        return col[0] === colName;
      })[1];
    });

    return vals;
  }

  function getData(url) {
    console.log(`Fetching data: ${url}`);

    try {
      const response = UrlFetchApp.fetch(url, {
        'method': 'get',
        'headers': {
          'accept': 'application/xml'
        }
      });
      return response.getContentText('UTF-8');
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
