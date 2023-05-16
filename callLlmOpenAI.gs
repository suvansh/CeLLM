function callLlmOpenAI(prompt, system_prompt="", max_tokens=null, temperature=null) {
  var apiKey = PropertiesService.getUserProperties().getProperty(openai_api_key_name);

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
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.5
    }),
  };
  var response = UrlFetchApp.fetch(openai_api_url, requestOptions);
  var jsonResponse = JSON.parse(response.getContentText());

  // Extract the generated text from the OpenAI API response
  var generatedText = jsonResponse.choices[0].message.content;

  Logger.log("OpenAI response: %s", generatedText);

  return generatedText;
}

