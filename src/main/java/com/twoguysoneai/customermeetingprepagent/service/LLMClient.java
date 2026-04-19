package com.twoguysoneai.customermeetingprepagent.service;

import com.twoguysoneai.customermeetingprepagent.dto.LLMRequest;
import com.twoguysoneai.customermeetingprepagent.dto.Message;
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

    private static final String MODEL = "claude-4.5-sonnet-20250929-ondemand_gapi";
    private static final String MODEL_HOST = "LLM_PROXY_BEDROCK";

    private final RestTemplate restTemplate;
    private final String completionsUrl;
    private final String jobsBaseUrl;
    private final int pollMaxAttempts;
    private final long pollIntervalMs;

    public LLMClient(
            RestTemplate restTemplate,
            @Value("${llm.api.url}") String completionsUrl,
            @Value("${llm.api.jobs-url}") String jobsBaseUrl,
            @Value("${llm.polling.max-attempts:30}") int pollMaxAttempts,
            @Value("${llm.polling.interval-ms:2000}") long pollIntervalMs) {
        this.restTemplate = restTemplate;
        this.completionsUrl = completionsUrl;
        this.jobsBaseUrl = jobsBaseUrl;
        this.pollMaxAttempts = pollMaxAttempts;
        this.pollIntervalMs = pollIntervalMs;
    }

    /**
     * Submits a prompt to the GAPI completions endpoint, polls the job until
     * it is COMPLETE or ERROR, then returns the result text.
     */
    public String call(String prompt) {
        String jobId = submitJob(prompt);
        return pollForResult(jobId);
    }

    // --- Private helpers ---

    private String submitJob(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("accept", "application/json");

        Message userMessage = new Message("user", "USER", prompt);
        LLMRequest requestBody = new LLMRequest(List.of(userMessage), MODEL, MODEL_HOST, 4000);

        HttpEntity<LLMRequest> request = new HttpEntity<>(requestBody, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(completionsUrl, request, Map.class);

        return extractJobId(response);
    }

    @SuppressWarnings("unchecked")
    private String extractJobId(Map<String, Object> response) {
        if (response == null) {
            throw new IllegalStateException("No response received from completions endpoint.");
        }
        try {
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            if (data != null) {
                String jobId = (String) data.get("job_id");
                if (jobId != null && !jobId.isBlank()) {
                    return jobId;
                }
            }
        } catch (ClassCastException e) {
            throw new IllegalStateException("Unexpected completions response structure: " + e.getMessage(), e);
        }
        throw new IllegalStateException("job_id missing from completions response: " + response);
    }

    private String pollForResult(String jobId) {
        String jobUrl = jobsBaseUrl + "/" + jobId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("accept", "application/json");

        for (int attempt = 1; attempt <= pollMaxAttempts; attempt++) {
            @SuppressWarnings("unchecked")
            Map<String, Object> jobResponse = restTemplate.getForObject(jobUrl, Map.class);

            String status = extractJobStatus(jobResponse);

            switch (status) {
                case "COMPLETE" -> { return extractCompletions(jobResponse); }
                case "ERROR"    -> { return extractJobError(jobResponse); }
                case "RUNNING"  -> sleep(pollIntervalMs);
                default         -> throw new IllegalStateException("Unknown job status: " + status);
            }
        }

        throw new IllegalStateException(
                "LLM job did not complete after " + pollMaxAttempts + " attempts (job_id: " + jobId + ").");
    }

    @SuppressWarnings("unchecked")
    private String extractJobStatus(Map<String, Object> jobResponse) {
        if (jobResponse == null) {
            throw new IllegalStateException("Null response when polling job status.");
        }
        try {
            Map<String, Object> data = (Map<String, Object>) jobResponse.get("data");
            if (data != null) {
                String status = (String) data.get("status");
                if (status != null) {
                    return status;
                }
            }
        } catch (ClassCastException e) {
            throw new IllegalStateException("Unexpected job response structure: " + e.getMessage(), e);
        }
        throw new IllegalStateException("status missing from job response: " + jobResponse);
    }

    @SuppressWarnings("unchecked")
    private String extractCompletions(Map<String, Object> jobResponse) {
        // Path: data -> result -> data -> completions
        try {
            Map<String, Object> data = (Map<String, Object>) jobResponse.get("data");
            Map<String, Object> result = (Map<String, Object>) data.get("result");
            Map<String, Object> resultData = (Map<String, Object>) result.get("data");
            String completions = (String) resultData.get("completions");
            if (completions != null) {
                return completions;
            }
        } catch (ClassCastException | NullPointerException e) {
            throw new IllegalStateException("Could not extract completions from job response: " + e.getMessage(), e);
        }
        throw new IllegalStateException("completions field missing from completed job response.");
    }

    @SuppressWarnings("unchecked")
    private String extractJobError(Map<String, Object> jobResponse) {
        try {
            Map<String, Object> data = (Map<String, Object>) jobResponse.get("data");
            if (data != null) {
                Object message = data.get("message");
                if (message instanceof String s) {
                    return "LLM job failed: " + s;
                }
            }
        } catch (ClassCastException e) {
            // fall through to generic message
        }
        return "LLM job failed with ERROR status.";
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Polling interrupted while waiting for LLM job.", e);
        }
    }
}

