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

function saveApiKey(apiKey, type) {
  var propertyName = null;
  if (type == "OpenAI") {
    propertyName = openai_api_key_name;
  }
  else if (type == "Anthropic") {
    propertyName = anthropic_api_key_name;
  }
  else {
    throw new Error('Model type not recognized: ' + type);
  }
  var scriptProperties = PropertiesService.getUserProperties();
  scriptProperties.setProperty(propertyName, apiKey);
}

function getApiKey(type) {
  var propertyName = null;
  if (type == "OpenAI") {
    propertyName = openai_api_key_name;
  }
  else if (type == "Anthropic") {
    propertyName = anthropic_api_key_name;
  }
  else if (type == "cellm") {
    propertyName = cellm_api_key_name;
  }
  else {
    throw new Error('Model type not recognized: ' + type);
  }
  var apiKey = PropertiesService.getUserProperties().getProperty(propertyName);
  return apiKey;
}

function CELLM(prompt, cellValue, type="OpenAI", max_tokens=250, temperature=0.9) {
  return callLlmOnCell(prompt, cellValue, type=type, max_tokens=max_tokens, temperature=temperature);
}

function CELLM_URL(prompt, url, type="OpenAI", max_tokens=250, temperature=0.9) {
  return callLlmOnUrl(prompt, url, type=type, max_tokens=max_tokens, temperature=temperature);
}
