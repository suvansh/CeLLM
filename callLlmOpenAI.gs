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

