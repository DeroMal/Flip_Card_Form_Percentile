/**
 * Handles POST requests.
 * @param {Object} e - The event object containing the request data.
 * @returns {Object} - The response object.
 */
function doPost(e) {
    try {
      // Parse the incoming JSON request body to extract data.
      var requestData = JSON.parse(e.postData.contents);
      
      // Get the active Google Sheet.
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      
      // Determine the type of request and handle accordingly.
      if (requestData.type === 'saveTime') {
        // Access the 'Time' sheet.
        var timeSheet = ss.getSheetByName("Time");
        if (!timeSheet) throw new Error("Time sheet not found.");
  
        // Append the provided time to the 'Time' sheet.
        timeSheet.appendRow([requestData.time]);
  
        // Calculate the player's percentile based on the provided time.
        var times = timeSheet.getRange(1, 1, timeSheet.getLastRow()).getValues();
        times = times.map(row => row[0]);
        var percentile = calculatePercentile(times, requestData.time);
        var rankingMessage = getRankingMessage(percentile);
  
        // Return a success response with the calculated percentile and ranking message.
        return ContentService.createTextOutput(JSON.stringify({ result: 'Success', percentile: percentile, message: rankingMessage }))
          .setMimeType(ContentService.MimeType.JSON);
  
      } else if (requestData.type === 'saveDetails') {
        // Access the 'PlayerDetails' sheet.
        var detailsSheet = ss.getSheetByName("PlayerDetails");
        if (!detailsSheet) throw new Error("PlayerDetails sheet not found.");
  
        // Fetch all emails from the 'PlayerDetails' sheet for duplication check.
        var emails = detailsSheet.getRange(1, 2, detailsSheet.getLastRow()).getValues().flat();
  
        // Convert the emails array to a Set for efficient lookup.
        var emailSet = new Set(emails);
  
        // Check if the provided email already exists in the Set.
        if (emailSet.has(requestData.Email)) {
          // If email exists, return a message indicating so.
          return ContentService.createTextOutput(JSON.stringify({ result: 'Success', message: 'Email already exists.' }))
            .setMimeType(ContentService.MimeType.JSON);
        } else {
          // If email doesn't exist, append the details to the 'PlayerDetails' sheet.
          detailsSheet.appendRow([requestData.Name, requestData.Email]);
          return ContentService.createTextOutput(JSON.stringify({ result: 'Success' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
  
      } else {
        // If the request type is neither 'saveTime' nor 'saveDetails', throw an error.
        throw new Error("Invalid request type.");
      }
      
    } catch (error) {
      // Log any errors for debugging purposes.
      Logger.log(error.toString());
      
      // Return an error response.
      return ContentService.createTextOutput(JSON.stringify({ result: 'Error', message: error.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  /**
   * Calculates the percentile of a given value within a dataset.
   * @param {Array} data - The dataset.
   * @param {number} value - The value to calculate the percentile for.
   * @returns {number} - The calculated percentile.
   */
  function calculatePercentile(data, value) {
    // Convert the provided time to seconds.
    var secondsValue = convertToSeconds(value);
    // Convert all times in the dataset to seconds.
    var secondsData = data.map(time => {
      if (typeof time === 'string') {
        return convertToSeconds(time);
      } else {
        Logger.log("Unexpected time format: " + time);
        return Infinity; // Default to a very high value if unexpected format.
      }
    });
  
    // Count the number of times greater than or equal to the provided time.
    var above = secondsData.filter(v => v >= secondsValue).length;
    var percentile = above / secondsData.length;
    
    // Convert to percentage and round to one decimal place.
    return Math.round(percentile * 1000) / 10;
  }
  
  /**
   * Generates a ranking message based on the provided percentile.
   * @param {number} percentile - The player's percentile.
   * @returns {string} - The ranking message.
   */
  function getRankingMessage(percentile) {
    if (percentile >= 99) {
      return "Amazing! You're in the top 1% of players!";
    } else if (percentile >= 90) {
      return "Great job! You're in the top 10% of players!";
    } else if (percentile >= 80) {
      return "Well done! You're in the top 20% of players!";
    } else if (percentile >= 50) {
      return "Good effort! You're in the top half of players!";
    } else {
      return "Keep practicing! You can improve your rank!";
    }
  }
  
  /**
   * Converts a time string in the format "MM:SS" to seconds.
   * @param {string} time - The time string.
   * @returns {number} - The time in seconds.
   */
  function convertToSeconds(time) {
    var parts = time.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  