package com.twoguysoneai.customermeetingprepagent.service;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.springframework.stereotype.Service;

@Service
public class DocumentService {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(10);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);
    private static final String DEFAULT_USER_AGENT = "Mozilla/5.0 (compatible; CustomerMeetingPrepAgent/1.0; +https://example.com/bot)";

    private final HttpClient httpClient;

    public DocumentService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    /**
     * Fetches the problem document for the given URL.
     */
    public String fetchProblemDocument(String problemUrl) {
        return fetchDocument(problemUrl, "problemUrl");
    }

    /**
     * Fetches the context/feature document for the given URL.
     */
    public String fetchContextDocument(String contextUrl) {
        return fetchDocument(contextUrl, "contextUrl");
    }

    private String fetchDocument(String url, String fieldName) {
        URI uri = parseAndValidate(url, fieldName);
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(REQUEST_TIMEOUT)
                .header("User-Agent", DEFAULT_USER_AGENT)
                .header("Accept", "text/plain, text/html, application/json, */*")
                .GET()
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while fetching document from URL: " + uri, ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to fetch document from URL: " + uri, ex);
        }

        if (response.statusCode() < 200 || response.statusCode() > 299) {
            if (response.statusCode() == 403) {
                throw new IllegalStateException(
                        "Failed to fetch document from URL: " + uri +
                                " (HTTP 403 - remote host denied request, often due to missing/blocked user-agent)"
                );
            }
            throw new IllegalStateException(
                    "Failed to fetch document from URL: " + uri + " (HTTP " + response.statusCode() + ")"
            );
        }

        String body = response.body();
        if (body == null || body.isBlank()) {
            throw new IllegalStateException("Fetched empty document from URL: " + uri);
        }
        return body;
    }

    private URI parseAndValidate(String url, String fieldName) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required and must be a valid HTTP/HTTPS URL");
        }

        URI uri;
        try {
            uri = new URI(url.trim());
        } catch (URISyntaxException ex) {
            throw new IllegalArgumentException(fieldName + " is not a valid URL: " + url, ex);
        }

        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            throw new IllegalArgumentException(fieldName + " must use http or https: " + url);
        }

        return uri;
    }
}

