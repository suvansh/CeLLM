function generateList() {
  // Display a dialog box for the user to enter the prompt and output cell
  var ui = SpreadsheetApp.getUi();
  
  // Asking for the prompt
  var promptResponse = ui.prompt('Generate List', 'Please enter the prompt:', ui.ButtonSet.OK_CANCEL);
  if (promptResponse.getSelectedButton() == ui.Button.OK) {
    var prompt = promptResponse.getResponseText();
  } else {
    return;  // Exit if the user cancelled.
  }

  // Asking for the starting cell
  var cellResponse = ui.prompt('Generate List', 'Please enter the cell to start the list:', ui.ButtonSet.OK_CANCEL);
  if (cellResponse.getSelectedButton() == ui.Button.OK) {
    var cellLocation = cellResponse.getResponseText();
  } else {
    return;  // Exit if the user cancelled.
  }

  // Process the user response
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var systemPrompt = "Make a newline-separated unbulleted, unnumbered list without bullet points according to the prompt below:\n" + prompt;
  var result = callLlm(prompt, system_prompt=systemPrompt, type="OpenAI", arcus=false, max_tokens=250, temperature=0.9);

  // Split the result into multiple parts based on the separator
  var separator = "\n";
  var items = result.split(separator);

  // Convert the items array into a 2D array for setValues
  var outputValues = items.map(function(item) {
    return [item.trim()];
  }).filter(function(item) {
    return item[0] !== "";
  });

  // Get the range where the results should be written
  var match = cellLocation.match(/([A-Z]+)(\d+)/);
  var column = match[1];
  var row = parseInt(match[2]);
  var newRow = row + outputValues.length - 1;
  var outputRange = sheet.getRange(cellLocation + ":" + column + newRow);

  // Write the results to the sheet
  outputRange.setValues(outputValues);
}

