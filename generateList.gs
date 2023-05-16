function generateList() {
  // Display a dialog box for the user to enter the prompt and output range
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Generate List', 'Please enter the prompt and the output range (separated by a semicolon):', ui.ButtonSet.OK_CANCEL);

  // Process the user's response
  if (response.getSelectedButton() == ui.Button.OK) {
    var inputs = response.getResponseText().split(';');
    var prompt = inputs[0].trim();
    var outputRangeA1 = inputs[1].trim();

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var cellValue = ""; // If you need a cell value, you can get it in a similar way

    var systemPrompt = "Make a newline-separated unnumbered list without bullet points according to the prompt below:\n" + prompt;
    var result = callLlm(filledPrompt, system_prompt=systemPrompt, max_tokens=250, temperature=0.9);

    // Split the result into multiple parts based on the separator
    var separator = "\n"; // Set this to the character that separates items in the list
    var items = result.split(separator);

    // Convert the items array into a 2D array for setValues
    var outputValues = items.map(function(item) {
      return [item.trim()]; // trim is used to remove leading/trailing whitespace
    }).filter(function(item) {
      return item[0] !== "";
    });

    // Get the range where the results should be written
    var outputRange = sheet.getRange(outputRangeA1 + ":" + outputRangeA1[0] + (parseInt(outputRangeA1.slice(1)) + outputValues.length - 1));

    // Write the results to the sheet
    outputRange.setValues(outputValues);
  }
}

