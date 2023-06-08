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
