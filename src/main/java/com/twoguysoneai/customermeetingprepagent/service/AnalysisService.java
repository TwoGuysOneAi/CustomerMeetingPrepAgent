package com.twoguysoneai.customermeetingprepagent.service;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AnalysisService {

    private static final int MAX_DOCUMENT_CHARS = 12_000;

    private final DocumentService documentService;
    private final LLMClient llmClient;

    public AnalysisService(DocumentService documentService, LLMClient llmClient) {
        this.documentService = documentService;
        this.llmClient = llmClient;
    }

    public String analyze(String customerName, String meetingContext, String previousMeetingNotes,
                          String problemUrl, List<String> contextUrls) {
        if (contextUrls == null || contextUrls.isEmpty()) {
            throw new IllegalArgumentException("contextUrls must contain at least one URL");
        }

        String problemDocument = cleanForLlm(documentService.fetchProblemDocument(problemUrl));
        List<String> contextDocuments = contextUrls.stream()
                .map(documentService::fetchContextDocument)
                .map(this::cleanForLlm)
                .toList();
        String prompt = buildPrompt(customerName, meetingContext, previousMeetingNotes, problemDocument, contextDocuments);
        return llmClient.call(prompt);
    }

    private String buildPrompt(String customerName, String meetingContext, String previousMeetingNotes,
                                String problemDocument, List<String> contextDocuments) {
        String formattedContextDocuments = formatContextDocuments(contextDocuments);

        String previousMeetingSection = (previousMeetingNotes != null && !previousMeetingNotes.isBlank())
                ? "\n=== PREVIOUS MEETING NOTES ===\n" + previousMeetingNotes.trim() + "\n"
                : "";

        return """
                You are a customer meeting preparation analyst. Analyze the documents below and produce a structured pre-meeting briefing.

                === CUSTOMER ===
                %s

                === MEETING CONTEXT & GOALS ===
                %s
                %s
                === PROBLEM DOCUMENT ===
                %s

                === CONTEXT DOCUMENTS ===
                %s

                Produce your response in exactly the following sections:

                1. Customer Snapshot
                   A brief overview of the customer and the relationship stage.

                2. Meeting Goals
                   What success looks like for this meeting, based on the stated context and goals.

                3. Problem Summary
                   A concise summary of the core problem described in the problem document.

                4. Key Challenges
                   A bulleted list of the main challenges identified.

                5. Mapping of Context to Problem
                   For each piece of context provided, explain how it relates to the problem or meeting goals.

                6. Proposed Talking Points
                   A clear, structured set of talking points or recommendations tailored to this customer and meeting.

                7. Risks / Gaps
                   Known risks, open questions, or missing information that could affect the meeting outcome.
                """.formatted(
                        customerName != null ? customerName : "Unknown",
                        meetingContext != null ? meetingContext : "",
                        previousMeetingSection,
                        problemDocument,
                        formattedContextDocuments);
    }

    private String formatContextDocuments(List<String> contextDocuments) {
        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < contextDocuments.size(); i++) {
            builder.append("Context Document ").append(i + 1).append(":\n")
                    .append(contextDocuments.get(i))
                    .append("\n\n");
        }

        return builder.toString().trim();
    }

    private String cleanForLlm(String document) {
        if (document == null || document.isBlank()) {
            return "";
        }

        String cleaned = document
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replaceAll("(?is)<script[^>]*>.*?</script>", " ")
                .replaceAll("(?is)<style[^>]*>.*?</style>", " ")
                .replaceAll("(?is)<[^>]+>", " ")
                .replace("&nbsp;", " ")
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&#39;", "'")
                .replaceAll("[\\t\\f\\u000B]+", " ")
                .replaceAll(" +", " ")
                .replaceAll("\n{3,}", "\n\n")
                .trim();

        if (cleaned.length() <= MAX_DOCUMENT_CHARS) {
            return cleaned;
        }

        return cleaned.substring(0, MAX_DOCUMENT_CHARS)
                + "\n\n[Truncated for prompt size. Original content was longer.]";
    }
}

