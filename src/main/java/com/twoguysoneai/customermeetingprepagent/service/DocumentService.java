package com.twoguysoneai.customermeetingprepagent.service;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class DocumentService {

    private static final String DEFAULT_USER_AGENT = "Mozilla/5.0 (compatible; CustomerMeetingPrepAgent/1.0; +https://example.com/bot)";

    // Matches Google Docs document URLs and captures the document ID
    private static final Pattern GOOGLE_DOCS_PATTERN =
            Pattern.compile("https://docs\\.google\\.com/document/d/([^/]+)(/.*)?");

    private final HttpClient httpClient;
    private final Duration requestTimeout;

    public DocumentService(
            @Value("${document.http.connect-timeout-seconds:15}") int connectTimeoutSeconds,
            @Value("${document.http.request-timeout-seconds:60}") int requestTimeoutSeconds) {
        this.requestTimeout = Duration.ofSeconds(requestTimeoutSeconds);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(connectTimeoutSeconds))
                .followRedirects(HttpClient.Redirect.ALWAYS)
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
        URI uri = parseAndValidate(rewriteIfGoogleDoc(url), fieldName);
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(requestTimeout)
                .header("User-Agent", DEFAULT_USER_AGENT)
                .header("Accept", "text/plain, text/html, application/json, */*")
                .GET()
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (HttpTimeoutException ex) {
            throw new IllegalStateException(
                    "Timed out fetching document from: " + uri +
                    ". If this is a Google Doc, ensure it is shared as 'Anyone with the link can view' " +
                    "and that the server has outbound internet access to docs.google.com.", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while fetching document from URL: " + uri, ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to fetch document from URL: " + uri, ex);
        }

        if (response.statusCode() < 200 || response.statusCode() > 299) {
            if (response.statusCode() == 403) {
                throw new IllegalStateException(
                        "Access denied (HTTP 403) fetching document from: " + uri +
                        ". For Google Docs, set sharing to 'Anyone with the link can view'."
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

        // Google Docs redirects unauthenticated export requests to a login page.
        // Detect this and surface a clear error instead of passing HTML to the LLM.
        String finalUrl = response.uri().toString();
        if (finalUrl.contains("accounts.google.com") || finalUrl.contains("google.com/sorry")) {
            throw new IllegalStateException(
                    "Google redirected to a login/consent page when fetching: " + uri +
                    ". Ensure the document is shared as 'Anyone with the link can view' " +
                    "and try opening the export URL in a browser: " + uri
            );
        }

        return body;
    }

    /**
     * Rewrites a Google Docs viewer URL to the plain-text export URL so the
     * document content is returned instead of the browser-gated HTML page.
     * e.g. https://docs.google.com/document/d/{ID}/edit
     *   -> https://docs.google.com/document/d/{ID}/export?format=txt
     */
    private String rewriteIfGoogleDoc(String url) {
        if (url == null) {
            return url;
        }
        Matcher matcher = GOOGLE_DOCS_PATTERN.matcher(url.trim());
        if (matcher.matches()) {
            String docId = matcher.group(1);
            return "https://docs.google.com/document/d/" + docId + "/export?format=txt";
        }
        return url;
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

