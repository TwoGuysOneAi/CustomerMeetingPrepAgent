package com.twoguysoneai.customermeetingprepagent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LLMClient {

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;

    public LLMClient(
            RestTemplate restTemplate,
            @Value("${llm.api.url}") String apiUrl,
            @Value("${llm.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    /**
     * Sends the prompt to the configured LLM API and returns the response text.
     */
    public String call(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // Request body follows the OpenAI chat completions format.
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(apiUrl, request, Map.class);

        return extractContent(response);
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> response) {
        if (response == null) {
            return "No response received from LLM.";
        }
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            return "Empty choices in LLM response.";
        }
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        if (message == null) {
            return "No message in LLM response.";
        }
        return (String) message.get("content");
    }
}

