function compareGroupUsers() {
  // Insert Gmail label name below
  const attachments = getLabeledAttachments('Alma users');
  // Insert Google Group email below
  const groupEmail = '';
  // Insert email from which script is running
  const accountEmail = '';

  if (attachments.length === 0) return;
  
  let blob;
  if (attachments[0].getContentType() == 'application/zip') {
    blob = Utilities.unzip(attachment.copyBlob())[0];
  } else {
    blob = attachments[0].copyBlob();
  }

  const csv = Utilities.parseCsv(blob.getDataAsString());
  // Keep only the first column of the report, which contains email addresses
  const usersInAlma = csv.slice(1).map(row => row[0]);
  // Filter out the email that runs the script, as it doesn't have Alma roles
  const usersInGroup = getGroupEmails(groupEmail).filter(email => email !== accountEmail);

  const onlyAlma = usersInAlma.filter(user => !usersInGroup.includes(user));
  const onlyGroup = usersInGroup.filter(user => !usersInAlma.includes(user));

  let body = '<h1>"LIB Alma Users" Google Group report</h1>';
  if (onlyAlma.length === 0 && onlyGroup.length === 0) {
    body += '<p>There are no current issues with group membership.</p>';
  } else {
    if (onlyAlma.length > 0) {
      body += '<h2>Users with employee Alma roles but not in Google Group:</h2>';
      body += '<ul>';
      for (const user of onlyAlma) { body += `<li>${user}</li>` }
      body += '</ul>';
    }
    if (onlyGroup.length > 0) {
      body += '<h2>Users in Google Group but without employee Alma roles:</h2>';
      body += '<ul>';
      for (const user of onlyGroup) { body += `<li>${user}</li>` }
      body += '</ul>';
    }
  }
  
  MailApp.sendEmail({
    to: 'user@example.com',
    subject: '"LIB Alma Users" Google Group report',
    htmlBody: body
  });

  function getLabeledAttachments(labelName) {
    const label = GmailApp.getUserLabelByName(labelName);
    if (label.getUnreadCount() == 0) return [];
    
    const threads = label.getThreads(0, label.getUnreadCount());
    const unreadThreads = threads.filter(thread => thread.isUnread());
    const attachments = [];
  
    for (const thread of unreadThreads) {
      const attachment = thread.getMessages()[0]
        .getAttachments({ includeInlineImages: false })[0];
      attachments.push(attachment);
      thread.markRead();
    }
  
    return attachments;
  }

  function getGroupEmails(groupEmail) {
    const group = GroupsApp.getGroupByEmail(groupEmail);
    // Subgroups throw exception due to no membership view access; uncomment below if you need subgroups
    // const subGroups = group.getGroups();
    const users = group.getUsers().map(user => user.getEmail());
    return users;
  }
}
