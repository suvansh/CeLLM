function callLlmOnUrl(prompt, url, type="OpenAI", max_tokens=250, temperature=0.9) {
  var webpageContent = fetchWebpageContent(url);
  Logger.log("Webpage content: %s", webpageContent);
  var systemPrompt = "You will be given the contents of a webpage. Respond to the prompt concisely using the content of the page."
  prompt = prompt.replace('{input}', webpageContent);

  return callLlm(prompt, system_prompt=systemPrompt, type=type, max_tokens=max_tokens, temperature=temperature);
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

