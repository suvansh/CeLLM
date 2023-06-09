function arcusCall(prompt) {
  var apiKey = getProperty(arcus_api_key_name);
  var projectId = "TKAAKBsUAM"; // hardcode CeLLM Arcus Project ID
  if (!apiKey) {
    Logger.log("To use Arcus, you need to set an Arcus API key in CeLLM --> Settings. Falling back to original prompt.")
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
