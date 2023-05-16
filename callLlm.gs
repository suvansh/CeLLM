function callLlm(prompt, system_prompt="", type="OpenAI", max_tokens=null, temperature=null) {
  if (type == "OpenAI") {
    return callLlmOpenAI(prompt, system_prompt=system_prompt, max_tokens=max_tokens, temperature=temperature);
  }
  else if (type == "Anthropic") {
    var prompt_with_system = (system_prompt !== "") ? system_prompt + " " + prompt : prompt;
    var formattedPrompt = `\n\nHuman: ${prompt_with_system}\n\nAssistant:`;
    return callLlmAnthropic(formattedPrompt, max_tokens_to_sample=max_tokens, temperature=temperature);
  }
  else {
    throw new Error('Model type not recognized: ' + type);
  }
}
