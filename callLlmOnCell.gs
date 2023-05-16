function callLlmOnCell(prompt, cellValue="", type="OpenAI", max_tokens=250, temperature=0.9) {
  var filledPrompt = prompt.replace('{input}', cellValue);
  return callLlm(filledPrompt, system_prompt="", type=type, max_tokens=max_tokens, temperature=temperature);
}
