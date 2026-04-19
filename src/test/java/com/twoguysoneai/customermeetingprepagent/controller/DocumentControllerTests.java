package com.twoguysoneai.customermeetingprepagent.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.twoguysoneai.customermeetingprepagent.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class DocumentControllerTests {

    private DocumentService documentService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        documentService = org.mockito.Mockito.mock(DocumentService.class);
        DocumentController controller = new DocumentController(documentService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void fetchProblemDocument_returnsContent_whenUrlIsValid() throws Exception {
        when(documentService.fetchProblemDocument("https://example.com/problem"))
                .thenReturn("problem content");

        mockMvc.perform(get("/api/documents/problem").param("url", "https://example.com/problem"))
                .andExpect(status().isOk())
                .andExpect(content().string("problem content"));
    }

    @Test
    void fetchProblemDocument_returnsBadRequest_whenUrlIsInvalid() throws Exception {
        when(documentService.fetchProblemDocument("invalid"))
                .thenThrow(new IllegalArgumentException("problemUrl is required and must be a valid HTTP/HTTPS URL"));

        mockMvc.perform(get("/api/documents/problem").param("url", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void fetchProblemDocument_returnsBadGateway_whenFetchFails() throws Exception {
        when(documentService.fetchProblemDocument("https://example.com/problem"))
                .thenThrow(new IllegalStateException("Failed to fetch document from URL: https://example.com/problem"));

        mockMvc.perform(get("/api/documents/problem").param("url", "https://example.com/problem"))
                .andExpect(status().isBadGateway());
    }
}

