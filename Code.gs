function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('CeLLM');
  menu.addItem('Generate List', 'generateList');
  menu.addItem('Settings', 'showSidebar');
  menu.addToUi();
}

function showSidebar() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('CeLLM Settings')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function setProperty(key, value) {
  PropertiesService.getUserProperties().setProperty(key, value);
}

function getProperty(key) {
  return PropertiesService.getUserProperties().getProperty(key);
}

function CELLM(prompt, cellValue="", llm="OpenAI", arcus=false, max_tokens=250, temperature=0.3) {
  return callLlmOnCell(prompt, cellValue, type=llm, arcus=arcus, max_tokens=max_tokens, temperature=temperature);
}

function CELLM_EX(exampleInputs, exampleOutputs, testInput, llm="OpenAI", arcus=false, max_tokens=250, temperature=0.3) {
  var minLength = Math.min(exampleInputs.length, exampleOutputs.length);
  var prompt = 'Given the following example inputs and outputs, please provide the output for the new input:\n';
  for (var i = 0; i < minLength; i++) {
    prompt += 'Input: ' + exampleInputs[i][0] + ', Output: ' + exampleOutputs[i][0] + '\n';
  }
  prompt += 'New input: ' + testInput + ', New output: ';
  return callLlm(prompt, "", type=llm, arcus=false, max_tokens=max_tokens, temperature=temperature); // Arcus not supported for this yet
}

function CELLM_URL(prompt, url, llm="OpenAI", arcus=false, max_tokens=250, temperature=0.3) {
  return callLlmOnUrl(prompt, url, type=llm, arcus=false, max_tokens=max_tokens, temperature=temperature); // Arcus not supported for this yet
}
