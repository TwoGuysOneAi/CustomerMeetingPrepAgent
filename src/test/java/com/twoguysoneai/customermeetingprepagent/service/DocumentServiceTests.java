package com.twoguysoneai.customermeetingprepagent.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DocumentServiceTests {

    private HttpServer httpServer;
    private DocumentService documentService;

    @BeforeEach
    void setUp() throws IOException {
        documentService = new DocumentService();
        httpServer = HttpServer.create(new InetSocketAddress(0), 0);

        httpServer.createContext("/problem", exchange -> {
            byte[] response = "Problem from URL".getBytes();
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });

        httpServer.createContext("/context", exchange -> {
            byte[] response = "Context from URL".getBytes();
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });

        httpServer.createContext("/error", exchange -> {
            byte[] response = "not found".getBytes();
            exchange.sendResponseHeaders(404, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });

        httpServer.createContext("/requires-user-agent", exchange -> {
            String userAgent = exchange.getRequestHeaders().getFirst("User-Agent");
            if (userAgent == null || !userAgent.contains("CustomerMeetingPrepAgent")) {
                exchange.sendResponseHeaders(403, -1);
                exchange.close();
                return;
            }

            byte[] response = "Allowed with user-agent".getBytes();
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });

        httpServer.start();
    }

    @AfterEach
    void tearDown() {
        if (httpServer != null) {
            httpServer.stop(0);
        }
    }

    @Test
    void fetchProblemDocument_readsBodyFromUrl() {
        String url = "http://localhost:" + httpServer.getAddress().getPort() + "/problem";

        String body = documentService.fetchProblemDocument(url);

        assertEquals("Problem from URL", body);
    }

    @Test
    void fetchContextDocument_readsBodyFromUrl() {
        String url = "http://localhost:" + httpServer.getAddress().getPort() + "/context";

        String body = documentService.fetchContextDocument(url);

        assertEquals("Context from URL", body);
    }

    @Test
    void fetchProblemDocument_throwsForInvalidUrl() {
        assertThrows(IllegalArgumentException.class, () -> documentService.fetchProblemDocument("not-a-url"));
    }

    @Test
    void fetchProblemDocument_throwsForQuotedUrl() {
        assertThrows(
                IllegalArgumentException.class,
                () -> documentService.fetchProblemDocument("\"https://en.wikipedia.org/wiki/Tesla\"")
        );
    }

    @Test
    void fetchProblemDocument_throwsForNonSuccessStatusCode() {
        String url = "http://localhost:" + httpServer.getAddress().getPort() + "/error";

        assertThrows(IllegalStateException.class, () -> documentService.fetchProblemDocument(url));
    }

    @Test
    void fetchProblemDocument_sendsUserAgentHeader() {
        String url = "http://localhost:" + httpServer.getAddress().getPort() + "/requires-user-agent";

        String body = documentService.fetchProblemDocument(url);

        assertEquals("Allowed with user-agent", body);
    }
}

