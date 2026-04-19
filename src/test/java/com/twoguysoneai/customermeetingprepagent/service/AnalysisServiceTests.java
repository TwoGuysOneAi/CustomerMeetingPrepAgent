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

        analysisService.analyze("Acme Corp", "Renewal meeting", null, "https://problem", List.of("https://context"));

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

        assertThrows(IllegalArgumentException.class, () -> analysisService.analyze("Acme", "context", null, "https://problem", List.of()));
    }

    @Test
    void analyze_truncatesVeryLongDocuments() {
        String longDocument = "a".repeat(12_500);
        StubDocumentService documentService = new StubDocumentService(longDocument, "context");
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("Acme Corp", "Renewal meeting", null, "https://problem", List.of("https://context"));

        assertTrue(llmClient.lastPrompt.contains("[Truncated for prompt size. Original content was longer.]"));
    }

    @Test
    void analyze_includesCustomerNameAndMeetingContextInPrompt() {
        StubDocumentService documentService = new StubDocumentService("problem doc", "context doc");
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("Globex Corporation", "Q2 renewal discussion", null, "https://problem", List.of("https://context"));

        String prompt = llmClient.lastPrompt;
        assertTrue(prompt.contains("Globex Corporation"));
        assertTrue(prompt.contains("Q2 renewal discussion"));
    }

    @Test
    void analyze_includesPreviousMeetingNotesInPromptWhenProvided() {
        StubDocumentService documentService = new StubDocumentService("problem doc", "context doc");
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("Globex Corporation", "Q2 renewal", "Last time we discussed pricing concerns.", "https://problem", List.of("https://context"));

        assertTrue(llmClient.lastPrompt.contains("Last time we discussed pricing concerns."));
    }

    @Test
    void analyze_omitsPreviousMeetingNotesSectionWhenBlank() {
        StubDocumentService documentService = new StubDocumentService("problem doc", "context doc");
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("Globex Corporation", "Q2 renewal", "", "https://problem", List.of("https://context"));

        assertTrue(!llmClient.lastPrompt.contains("PREVIOUS MEETING NOTES"));
    }

    @Test
    void analyze_omitsPreviousMeetingNotesSectionWhenNull() {
        StubDocumentService documentService = new StubDocumentService("problem doc", "context doc");
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("Globex Corporation", "Q2 renewal", null, "https://problem", List.of("https://context"));

        assertTrue(!llmClient.lastPrompt.contains("PREVIOUS MEETING NOTES"));
    }

    @Test
    void analyze_promptContainsAllTenSectionHeadings() {
        StubDocumentService documentService = new StubDocumentService("problem doc", "context doc");
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("Globex Corporation", "Q2 renewal", "Previous notes.", "https://problem", List.of("https://context"));

        String prompt = llmClient.lastPrompt;
        assertTrue(prompt.contains("Customer Snapshot"));
        assertTrue(prompt.contains("Meeting Goals"));
        assertTrue(prompt.contains("Gaps"));
        assertTrue(prompt.contains("What Changed Since Last Meeting"));
        assertTrue(prompt.contains("What Matters Now"));
        assertTrue(prompt.contains("Mapping of Context to Problem"));
        assertTrue(prompt.contains("Top Risks / Opportunities"));
        assertTrue(prompt.contains("Suggested Talking Points"));
        assertTrue(prompt.contains("Recommended Next Actions"));
    }

    @Test
    void analyze_promptIndicatesFirstMeetingWhenNoPreviousNotesProvided() {
        StubDocumentService documentService = new StubDocumentService("problem doc", "context doc");
        CapturingLlmClient llmClient = new CapturingLlmClient();
        AnalysisService analysisService = new AnalysisService(documentService, llmClient);

        analysisService.analyze("Globex Corporation", "Q2 renewal", null, "https://problem", List.of("https://context"));

        assertTrue(llmClient.lastPrompt.contains("first meeting"));
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

