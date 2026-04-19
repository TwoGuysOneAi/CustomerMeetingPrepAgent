package com.twoguysoneai.customermeetingprepagent.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class AnalysisServiceTests {

    @Test
    void analyze_cleansHtmlAndScriptsBeforeSendingToLlm() {
        StubDocumentService documentService = new StubDocumentService(
                "<h1>Problem&nbsp;A</h1><script>alert('x')</script>",
                "<div>Feature &amp; Context</div><style>.x{}</style>"
        );
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("https://problem", List.of("https://context"));

        String prompt = llmClient.lastPrompt;
        assertTrue(prompt.contains("Problem A"));
        assertTrue(prompt.contains("Feature & Context"));
        assertTrue(!prompt.contains("<script>"));
        assertTrue(!prompt.contains("<style>"));
        assertTrue(!prompt.contains("<h1>"));
    }

    @Test
    void analyze_rejectsEmptyContextUrls() {
        AnalysisService analysisService = new AnalysisService(new StubDocumentService("problem", "context"), new CapturingLlmClient());

        assertThrows(IllegalArgumentException.class, () -> analysisService.analyze("https://problem", List.of()));
    }

    @Test
    void analyze_truncatesVeryLongDocuments() {
        String longDocument = "a".repeat(12_500);
        StubDocumentService documentService = new StubDocumentService(longDocument, "context");
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("https://problem", List.of("https://context"));

        assertTrue(llmClient.lastPrompt.contains("[Truncated for prompt size. Original content was longer.]"));
    }

    private static class StubDocumentService extends DocumentService {

        private final String problemDocument;
        private final String contextDocument;

        private StubDocumentService(String problemDocument, String contextDocument) {
            super(5, 10);
            this.problemDocument = problemDocument;
            this.contextDocument = contextDocument;
        }

        @Override
        public String fetchProblemDocument(String problemUrl) {
            return problemDocument;
        }

        @Override
        public String fetchContextDocument(String contextUrl) {
            return contextDocument;
        }
    }

    private static class CapturingLlmClient extends LLMClient {

        private String lastPrompt;

        private CapturingLlmClient() {
            super(null, "", "", 1, 0);
        }

        @Override
        public String call(String prompt) {
            this.lastPrompt = prompt;
            return "ok";
        }
    }
}

