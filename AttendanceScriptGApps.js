/**
* Generates a login activity report for the hours of 0600 GMT to 1000 GMT for all users in the "Students" sub-organization.
* Makes use of custom schemas including student data: ID #, Campus Code, and Grade Level
 */

var id = "INSERT SHEET ID HERE";
var ss = SpreadsheetApp.openById(id);
var optionalArgs = {
    'projection' : 'full' 
}

function generateLoginActivityReport() {
  var now = new Date();
  var start = new Date( 2020, now.getMonth(), now.getDate(), 04, 59, 0, 0); //year is hard coded because .getYear() always returned "0120"
  var end = new Date( 2020, now.getMonth(), now.getDate(), 09, 00, 0, 0); // also these times are in Zulu (I think) - hour, minute, second, millisecond
  var startTime = start.toISOString();
  var endTime = end.toISOString();

  var rows = [];
  var pageToken;
  var page;
  do {
    page = AdminReports.Activities.list('all', 'login', {
      // I suspect there is a way to filter by organization here in this line, but I couldn't find the options/parameters
      startTime: startTime,
      endTime: endTime,
      pageToken: pageToken
    });
    var items = page.items;
    if (items) {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var user = AdminDirectory.Users.get(item.actor.email); // create user variable which we can use to get familyName and givenName later
        var userEmail = AdminDirectory.Users.get(item.actor.email).primaryEmail; // create userEmail variable which we can use to pass as a user ID into the function for custom schema retreival
        var sub = AdminDirectory.Users.get(userEmail).orgUnitPath.substr(1,8); // this might be specific to my organization, I want to only add rows for users in the "Students" sub-organization
                             
        if ( sub == "Students" ) {
        var studentID = ["", "", ""]; // creates variable that we populate with the return array from the userSchemas function
        studentID = userSchemas(userEmail); // runs userSchemas function, passing the user's email and returning 3 custom schemas specific to my organization
        var row = [
          new Date(item.id.time),
          user.name.familyName,
          user.name.givenName,
          studentID[0],
          studentID[1],
          studentID[2],
          item.actor.email,
          item.events[0].name
        ];
        rows.push(row);
        }
      }
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  if (rows.length > 0) {
    var sheet = ss.getActiveSheet();

    // Append the headers.
    var headers = ['Time', 'Last Name', 'First Name', 'Student ID', 'Grade', 'Campus', 'Account', 'Login Type']; // headers row MUST match row length created in the for loop
    sheet.appendRow(headers);

    // Append the results.
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    formatDate(); // get the date column in better format - recommend formatting other columns like student id to include leading zeros

    Logger.log('Report spreadsheet created: %s', ss.getUrl());
  } else {
    Logger.log('No results returned.');
  }
}

function formatDate(){
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getActiveSheet();
  sheet.getRange("A2:A").setNumberFormat('dd MMM yyyy hh:mm a');
};

function userSchemas(userEmail) {

  var optionalArgs = {
    'projection' : 'full' 
  }
  var email = userEmail;
  
  var studentID = ["", "", ""];
  studentID[0] = AdminDirectory.Users.get(email, optionalArgs).customSchemas.StudentData.id; // the optionalArgs here are set as a global variable, you need projection set to full in order to get custom schemas from the AdminDirectory SDK
  studentID[1] = AdminDirectory.Users.get(email, optionalArgs).customSchemas.StudentData.grade;
  studentID[2] = AdminDirectory.Users.get(email, optionalArgs).customSchemas.StudentData.campus;
  
  return studentID;
  
}
