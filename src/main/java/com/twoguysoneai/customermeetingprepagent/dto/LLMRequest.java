package com.twoguysoneai.customermeetingprepagent.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class LLMRequest {

    @JsonProperty("text")
    private String text = "";

    @JsonProperty("messages")
    private List<Message> messages;

    @JsonProperty("model")
    private String model;

    @JsonProperty("model_host")
    private String modelHost;

    @JsonProperty("max_tokens")
    private int maxTokens;

    @JsonProperty("temperature")
    private int temperature;

    @JsonProperty("custom_prompt")
    private String customPrompt = "";

    @JsonProperty("custom_messages_prompt")
    private List<Object> customMessagesPrompt = List.of();

    @JsonProperty("is_streaming")
    private boolean isStreaming;

    @JsonProperty("enable_throttling")
    private boolean enableThrottling;

    @JsonProperty("return_raw")
    private boolean returnRaw;

    @JsonProperty("model_specific_parameters")
    private Map<String, Object> modelSpecificParameters = Map.of();

    public LLMRequest() {}

    public LLMRequest(List<Message> messages, String model, String modelHost, int maxTokens) {
        this.messages = messages;
        this.model = model;
        this.modelHost = modelHost;
        this.maxTokens = maxTokens;
        this.returnRaw = true;
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getModelHost() { return modelHost; }
    public void setModelHost(String modelHost) { this.modelHost = modelHost; }

    public int getMaxTokens() { return maxTokens; }
    public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }

    public int getTemperature() { return temperature; }
    public void setTemperature(int temperature) { this.temperature = temperature; }

    public String getCustomPrompt() { return customPrompt; }
    public void setCustomPrompt(String customPrompt) { this.customPrompt = customPrompt; }

    public List<Object> getCustomMessagesPrompt() { return customMessagesPrompt; }
    public void setCustomMessagesPrompt(List<Object> customMessagesPrompt) { this.customMessagesPrompt = customMessagesPrompt; }

    public boolean isStreaming() { return isStreaming; }
    public void setStreaming(boolean streaming) { isStreaming = streaming; }

    public boolean isEnableThrottling() { return enableThrottling; }
    public void setEnableThrottling(boolean enableThrottling) { this.enableThrottling = enableThrottling; }

    public boolean isReturnRaw() { return returnRaw; }
    public void setReturnRaw(boolean returnRaw) { this.returnRaw = returnRaw; }

    public Map<String, Object> getModelSpecificParameters() { return modelSpecificParameters; }
    public void setModelSpecificParameters(Map<String, Object> modelSpecificParameters) { this.modelSpecificParameters = modelSpecificParameters; }
}

