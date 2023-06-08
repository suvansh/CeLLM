// FILE: Code.gs
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

function CELLM(prompt, cellValue, llm="OpenAI", arcus=false, max_tokens=250, temperature=0.3) {
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



// FILE: arcus.gs
function arcusCall(prompt) {
  var apiKey = getProperty(arcus_api_key_name);
  var projectId = getProperty(arcus_project_id_name);
  if (!apiKey || !projectId) {
    Logger.log("To use Arcus, you need both API key and Project ID. Falling back to original prompt.")
    return prompt;
  }
  var requestOptions = {
    method: "post",
    headers: {
      "Authorization": "Bearer " + apiKey,
    },
    payload: JSON.stringify({
      prompt: prompt
    }),
    contentType: 'application/json',
  };
  var fullRequestURL = arcus_api_url + `?project_id=${projectId}`;
  var response = UrlFetchApp.fetch(fullRequestURL, requestOptions);
  var jsonResponse = JSON.parse(response.getContentText());
  enriched_prompt = jsonResponse['enriched_prompt'];
  return enriched_prompt;
}

function getArcusPrompt(prompt) {
  try {
    prompt = arcusCall(prompt);
  }
  catch (e) {  // silently fall back to original prompt
    Logger.log("Error during Arcus call: %s", e);
  }
  return prompt;
}



// FILE: callLlm.gs
function callLlmOnCell(prompt, cellValue="", type="OpenAI", arcus=false, max_tokens=250, temperature=0.3) {
  let filledPrompt = prompt.includes('{input}') ? prompt.replace('{input}', cellValue) : prompt + "\n" + cellValue;
  return callLlm(filledPrompt, system_prompt="", type=type, arcus=arcus, max_tokens=max_tokens, temperature=temperature);
}

function callLlm(prompt, system_prompt="", type="OpenAI", arcus=false, max_tokens=250, temperature=0.3) {
  Logger.log("Original prompt: %s", prompt);
  if (arcus) {
    prompt = getArcusPrompt(prompt);
    Logger.log("Post-Arcus prompt: %s", prompt);
  }
  
  let parts = type.split(":");
  let provider = parts[0].toLowerCase();
  let model = (parts.length > 1) ? parts[1] : null;
  if (provider == "openai") {
    return callLlmOpenAI(prompt, system_prompt=system_prompt, model=model, max_tokens=max_tokens, temperature=temperature);
  }
  else if (provider == "anthropic") {
    var prompt_with_system = (system_prompt === "") ? prompt : system_prompt + "\n" + prompt;
    var formattedPrompt = `\n\nHuman: ${prompt_with_system}\n\nAssistant: `;
    return callLlmAnthropic(formattedPrompt, model=model, max_tokens_to_sample=max_tokens, temperature=temperature);
  }
  else {
    throw new Error('Model type not recognized: ' + provider);
  }
}



// FILE: callLlmAnthropic.gs
function callLlmAnthropic(prompt, model=null, max_tokens_to_sample=250, temperature=0.5) {
  var apiKey = getProperty(anthropic_api_key_name);
  model = (model !== null) ? model : "claude-instant-v1";

  var requestOptions = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    payload: JSON.stringify({
      model: model,
      prompt: prompt,
      max_tokens_to_sample: max_tokens_to_sample,
      temperature: temperature
    }),
  };
  var response = UrlFetchApp.fetch(anthropic_api_url, requestOptions);
  var jsonResponse = JSON.parse(response.getContentText());

  // Extract the generated text from the OpenAI API response
  var generatedText = jsonResponse.completion;

  Logger.log("Anthropic response: %s", generatedText);

  return generatedText;
}




// FILE: callLlmOnCell.gs
function callLlmOnCell(prompt, cellValue="", type="OpenAI", max_tokens=250, temperature=0.9) {
  var filledPrompt = prompt.replace('{input}', cellValue);
  return callLlm(filledPrompt, system_prompt="", type=type, max_tokens=max_tokens, temperature=temperature);
}



// FILE: callLlmOnUrl.gs
function callLlmOnUrl(prompt, url, type="OpenAI", arcus=false, max_tokens=250, temperature=0.3) {
  // doesn't support Arcus
  var webpageContent = fetchWebpageContent(url);
  var systemPrompt = "You will be given the contents of a webpage. Respond to the prompt concisely using the content of the page."
  let filledPrompt = prompt.includes('{input}') ? prompt.replace('{input}', webpageContent) : prompt + "\n" + webpageContent;
  return callLlm(filledPrompt, system_prompt=systemPrompt, type=type, arcus=arcus, max_tokens=max_tokens, temperature=temperature);
}


function fetchWebpageContent(url) {
  var response = UrlFetchApp.fetch(url);
  var html = response.getContentText();
  
  // Extract the content within the <body> tag
  var bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/gi);
  
  if (bodyContent && bodyContent.length > 0) {
    // Remove all HTML tags
    var textContent = bodyContent[0].replace(/<[^>]*>?/gm, '');
    
    // Remove extra whitespace and line breaks
    textContent = textContent.replace(/\s\s+/g, ' ').trim();

    return textContent;
  } else {
    return '';
  }
}




// FILE: callLlmOpenAI.gs
function callLlmOpenAI(prompt, system_prompt="", model=null, max_tokens=250, temperature=0.9) {
  var apiKey = getProperty(openai_api_key_name);
  model = (model !== null) ? model : "gpt-3.5-turbo";

  var messages = [
    {"role": "user", "content": prompt}
  ];
  if (system_prompt !== "") {
    messages.unshift({"role": "system", "content": system_prompt});
  }

  var requestOptions = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    payload: JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: max_tokens
    }),
  };
  var response = UrlFetchApp.fetch(openai_api_url, requestOptions);
  var jsonResponse = JSON.parse(response.getContentText());

  // Extract the generated text from the OpenAI API response
  var generatedText = jsonResponse.choices[0].message.content;

  Logger.log("OpenAI response: %s", generatedText);

  return generatedText;
}




// FILE: consts.gs
anthropic_api_key_name = 'Anthropic_API_KEY';
anthropic_api_url = "https://api.anthropic.com/v1/complete";

openai_api_key_name = 'OpenAI_API_KEY';
openai_api_url = "https://api.openai.com/v1/chat/completions";

arcus_api_key_name = 'Arcus_API_KEY';
arcus_project_id_name = 'Arcus_PROJECT_ID';
arcus_api_url = "https://api.arcus.co/prompt/enrich";



// FILE: generateList.gs
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




