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

        String previousMeetingInstruction = (previousMeetingNotes != null && !previousMeetingNotes.isBlank())
                ? "5. What Changed Since Last Meeting\n" +
                  "   Based on the previous meeting notes, summarise what has changed, progressed, or been resolved since the last meeting. Include a brief recent interactions summary.\n"
                : "5. What Changed Since Last Meeting\n" +
                  "   No previous meeting notes were provided. State that this appears to be a first meeting or no prior context is available.\n";

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

                Produce your response in EXACTLY the following 10 sections, using these exact headings:

                1. Customer Snapshot
                   A brief overview of the customer, relationship stage, and any notable customer health signals (e.g. sentiment, engagement level, renewal risk, growth indicators).

                2. Meeting Goals
                   What success looks like for this meeting based on the stated context and goals. Be specific and outcome-oriented.

                3. Gaps
                   List any opening questions or missing information that should be clarified at the start of the meeting to ensure it stays on track.

                %s
                6. What Matters Now
                   Based on all available context, what is the single most important thing this customer cares about right now? Frame it from their perspective.

                7. Mapping of Context to Problem
                   For each piece of context provided, explain how it directly relates to the problem or the meeting goals.

                8. Top Risks / Opportunities
                   A concise list of the most important risks to be aware of and the biggest opportunities to capitalise on in this meeting.

                9. Suggested Talking Points
                   A structured set of specific, customer-tailored talking points to guide the conversation. Prioritise by importance.

                10. Recommended Next Actions
                    Concrete follow-up actions to propose at the end of the meeting, with suggested owners where possible.
                """.formatted(
                        customerName != null ? customerName : "Unknown",
                        meetingContext != null ? meetingContext : "",
                        previousMeetingSection,
                        problemDocument,
                        formattedContextDocuments,
                        previousMeetingInstruction);
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

