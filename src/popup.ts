import * as moment from 'moment';
import * as $ from 'jquery';
import * as SP from './datatypes';
import * as Listener from './listeners';
import * as Helper from './helper';

let count = 0;

// Functions

function clockPoll() {
  $('#time').text(moment().format('HH:mm:ss'));
  setTimeout(clockPoll, 1000); // 1 second polling
}

function calendarPoll() {
  // Get SP Academic Calendar and read from JSON
  let request = new XMLHttpRequest();
  request.onloadend = function () {
    if (this.status == 200) {
      // Get all objects 
      let allCalendarEntries: SP.CalendarEntry[] = JSON.parse(this.responseText);
      let relevantEntries: SP.CalendarEntry[] = [];
      for (var i = 0; i < allCalendarEntries.length; i++) {
        let startDate = Date.parse(allCalendarEntries[i].startTime);
        let endDate = Date.parse(allCalendarEntries[i].endTime);
        let currentDate = Date.now();
        if (currentDate > startDate && currentDate < endDate) {
          relevantEntries.push(allCalendarEntries[i]);
        }
      }

      // Set status
      if (relevantEntries.length > 0) {
        let schoolStateString: string = "";
        relevantEntries.forEach(element => {
          schoolStateString += ", ";
          schoolStateString += element.summary;
        });
        schoolStateString = schoolStateString.substr(2, schoolStateString.length);   // Remove the first 2 characters
        $('#currentStatus').text(schoolStateString);
      } else {
        $('#currentStatus').text("No School Events");
      }
    }

    // Repeat request once it is loaded or unsuccessfully loaded
    console.log("[DEBUG]: Loaded SP Calendar");
    setTimeout(calendarPoll, 1000 * 60 * 5); // 5 min polling
  };
  request.open("GET", "https://mobileapps.sp.edu.sg/SPMobileAPI/api/GetAcadCalendar", true);
  request.send();
}

function timetablePoll() {
  // Get timetable for today and see if user is attending lesson
  Helper.userIsAuthenticated(function (authenticated, token) {
    if (authenticated && token) {
      let currentDateString = moment().format('DDMMYY');
      console.log("[DEBUG] Requested for timetable with date: " + currentDateString);
      let request = Helper.authenticatedRequest("GET", "https://mobileapps.sp.edu.sg/SPMobileAPI/api/GetStudentTimetableByIdAndDate/"+currentDateString, true, token);
      request.onloadend = function () {
        if (this.status == 200) {
          console.log(this.responseText);
        } else {
          console.log("[DEBUG]: Failed to load timetable: ")
          console.log(this.responseText);
        }
      }
      request.send();
    }
  });
}

// Initialisation for jQuery. This block runs when document is ready
$(function () {
  const queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    // $('#url').text(tabs[0].url);
    $('#time').text(moment().format('HH:mm:ss'));
  });

  chrome.browserAction.setBadgeText({ text: count.toString() });
  $('#countUp').click(() => {
    chrome.browserAction.setBadgeText({ text: (++count).toString() });
  });

  // $('#changeBackground').click(()=>{
  //   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //     chrome.tabs.sendMessage(tabs[0].id, {
  //       color: '#555555'
  //     },
  //     function(msg) {
  //       console.log("result message:", msg);
  //     });
  //   });
  // });

  // First things first, check if user is authenticated
  Helper.userIsAuthenticated(function (authenticated) {
    if (authenticated) {
      // User is logged in, show main UI and initialise pollers
      $('#main').show();
      $('#auth').hide();

      clockPoll();
      calendarPoll();
      timetablePoll();
      setInterval(timetablePoll, 1000*60*5); // 5 minute timetable polling
    } else {
      // Not authenticated, display login UI
      $('#main').hide();
      $('#auth').show();
    }
  });

  // Initialise Login listener
  $('#loginButton').click(Listener.loginListener);
});
