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

