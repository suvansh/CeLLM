function callLlmAnthropic(prompt, max_tokens_to_sample=250, temperature=0.5) {
  var apiKey = PropertiesService.getUserProperties().getProperty(anthropic_api_key_name);

  var requestOptions = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    payload: JSON.stringify({
      model: "claude-instant-v1",
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

