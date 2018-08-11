import * as moment from 'moment';

//#region Constant strings

export const ERROR_AUTH_INVALID_JSON = "Login server returned an invalid response. Please contact the developer.";
export const ERROR_AUTH_INVALID_PASSWORD = "Incorrect password or username";

export const TIMETABLE_NO_LESSONS = '[{"abbreviation":"","startTime":"","endTime":"","event":null,"type":"","code":"","location":""}]';

export const URL_ATS = "https://myats.sp.edu.sg/psc/cs90atstd/EMPLOYEE/HRMS/s/WEBLIB_A_ATS.ISCRIPT1.FieldFormula.IScript_SubmitAttendance";
export const URL_ATS_LOGIN = "https://myats.sp.edu.sg/psc/cs90atstd/EMPLOYEE/HRMS/s/WEBLIB_A_ATS.ISCRIPT1.FieldFormula.IScript_SubmitAttendance?cmd=login&languageCd=ENG";

//#endregion Constant strings


//#region Calendar

export interface CalendarEntry {
  summary: string;
  startTime: string;
  endTime: string;
  colorId: string;
};

//#endregion Calendar


//#region User

/**
 * A class that encapsulates user information, such as the user's 
 * access token and name, and provides common functionality such as 
 * JSON validation and conversion.
 */
export class User {

  constructor(
    private accessToken: string,
    private name: string
  ) { }

  /**
   * Retrieves the access token for this `User`
   */
  getAccessToken(): string {
    return this.accessToken;
  }

  getName(): string {
    return this.name;
  }

  /**
   * Converts a piece of JSON into an `User` object
   * @param json The JSON to convert to an `User` object
   * @param dateString The string of the date, in DDMMYY format
   */
  static fromJSON(json: string): User {
    let rawJSON = JSON.parse(json);
    return new User(rawJSON['access_token'], rawJSON['name']);
  }

  /**
   * Validates a JSON string to be a User object
   * @param json The JSON string to validate
   */
  static isValid(json: string): boolean {
    let unvalidatedJSON = JSON.parse(json);
    let valid = false;

    unvalidatedJSON.hasOwnProperty('access_token') ? valid = true : valid = false;
    unvalidatedJSON.hasOwnProperty('name') ? valid = true : valid = false;

    return valid;
  }
}

// export interface UserJSON {
//   access_token: string;
//   token_type: string;
//   expires_in: number;
//   role: string;
//   name: string;
// };

//#endregion User

//#region Timetable

export enum TimetableEntryType {
  Lab = "LAB",
  Lecture = "LEC",
  Tutorial = "TUT"
}

// Typical entry: {"abbreviation":"AMT","startTime":"13:00","endTime":"17:00","event":null,"type":"LAB","code":"ET0720","location":"T12605"}

export class TimetableEntry {

  constructor(
    private abbreviation: string,
    private startTime: Date,
    private endTime: Date,
    private type: TimetableEntryType,
    private code: string,
    private location: string
  ) { }

  getAbbreviation(): string {
    return this.abbreviation;
  }

  getType(): string {
    return this.type;
  }

  /**
   * Outputs the full formal version of each type of lesson, such as LEC->Lecture
   */
  getTypeString(): string {
    switch (this.type) {
      case TimetableEntryType.Lab:
        return "Lab";
      case TimetableEntryType.Lecture:
        return "Lecture";
      case TimetableEntryType.Tutorial:
        return "Tutorial";
    }
  }

  /**
   * Retrieves the module code for this timetable entry
   */
  getModuleCode(): string {
    return this.code;
  }

  /**
   * Retrieves the location in which this lesson is taking place
   */
  getLocation(): string {
    return this.location;
  }

  /**
   * Gets the starting date and time in a `Date` object of this lesson
   */
  getStartDateTime(): Date {
    return this.startTime;
  }

  /**
   * Gets the ending date and time in a `Date` object of this lesson
   */
  getEndDateTime(): Date {
    return this.endTime;
  }

  /**
   * Converts a piece of JSON into a `TimetableEntry`
   * @param json The JSON to convert to a `TimetableEntry`
   * @param dateString The string of the date, in DDMMYY format
   */
  static fromJSON(json: string, dateString: string): TimetableEntry {
    let rawJSON = JSON.parse(json);

    // Parse the date and time of the timetable entry first
    let startTimeString: string = rawJSON['startTime'];
    let startTime = moment(dateString, "DDMMYY");
    startTime.hour(parseInt(startTimeString.substr(0, 2), 10));
    startTime.minute(parseInt(startTimeString.substr(3, 5), 10));

    let endTimeString: string = rawJSON['endTime'];
    let endTime = moment(dateString, "DDMMYY");
    endTime.hour(parseInt(endTimeString.substr(0, 2), 10));
    endTime.minute(parseInt(endTimeString.substr(3, 5), 10));

    let entry = new TimetableEntry(
      rawJSON['abbreviation'],
      startTime.toDate(),
      endTime.toDate(),
      rawJSON['type'],
      rawJSON['code'],
      rawJSON['location']
    );
    return entry;
  }

  /**
   * Validates a JSON string to be a `TimetableEntry` object
   * @param json The JSON string to validate
   */
  static isValid(json: string): boolean {
    let unvalidatedJSON = JSON.parse(json);
    let valid = false;

    unvalidatedJSON.hasOwnProperty('abbreviation') ? valid = true : valid = false;
    unvalidatedJSON.hasOwnProperty('startTime') ? valid = true : valid = false;
    unvalidatedJSON.hasOwnProperty('endTime') ? valid = true : valid = false;
    unvalidatedJSON.hasOwnProperty('type') ? valid = true : valid = false;
    unvalidatedJSON.hasOwnProperty('code') ? valid = true : valid = false;
    unvalidatedJSON.hasOwnProperty('location') ? valid = true : valid = false;

    return valid;
  }
}

//#endregion Timetable
