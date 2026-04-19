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

        String contextChangesInstruction = (previousMeetingNotes != null && !previousMeetingNotes.isBlank())
                ? "\"context_changes\": { \"previous_state\": \"<initial reported issue or baseline>\", \"current_state\": \"<updated understanding based on previous meeting notes>\", \"key_events\": [\"<key milestone or change 1>\"] }"
                : "\"context_changes\": { \"previous_state\": null, \"current_state\": \"No previous meeting notes provided. This appears to be a first meeting.\", \"key_events\": [] }";

        return """
                You are a customer meeting preparation analyst. Analyze the documents below and return a single valid JSON object.

                CRITICAL RULES:
                - Return ONLY the JSON object. No markdown, no code fences, no explanatory text before or after.
                - Every string value must be plain text with no markdown formatting.
                - Never omit a required key. Use null for unknown fields and [] for empty arrays.
                - All enum values must exactly match the options listed.

                === CUSTOMER ===
                %s

                === MEETING CONTEXT & GOALS ===
                %s
                %s
                === PROBLEM DOCUMENT ===
                %s

                === CONTEXT DOCUMENTS ===
                %s

                Return a JSON object with EXACTLY this structure:
                {
                  "customer_snapshot": {
                    "customer": "<customer or company name>",
                    "relationship_stage": "<New | Active | At-Risk | Renewal>",
                    "health_signals": {
                      "risk_level": "<Low | Medium | High>",
                      "business_impact": "<Low | Medium | High | Critical>",
                      "renewal_risk": "<Low | Medium | High>",
                      "risk_alert": "<one-line alert string, or null if none>"
                    },
                    "summary": "<2-3 sentence overview of the customer and relationship>"
                  },
                  "meeting_goals": [
                    "<specific, outcome-oriented goal 1>",
                    "<goal 2>"
                  ],
                  "gaps": [
                    {
                      "question": "<opening question or unknown>",
                      "why_it_matters": "<why this gap matters to the meeting outcome>",
                      "suggested_approach": "<how to surface or ask about this>"
                    }
                  ],
                  "problem_summary": "<concise summary of the core problem>",
                  %s,
                  "what_matters_now": {
                    "headline": "<single most important thing the customer cares about right now>",
                    "detail": "<supporting explanation framed from the customer perspective>"
                  },
                  "problem_mapping": [
                    {
                      "context_source": "<which context document or area>",
                      "relevance": "<how it directly relates to the problem or meeting goals>"
                    }
                  ],
                  "risks_and_opportunities": {
                    "risks": ["<risk 1>", "<risk 2>"],
                    "opportunities": ["<opportunity 1>", "<opportunity 2>"]
                  },
                  "talking_points": [
                    {
                      "phase": "<Opening | Diagnosis | Solution | Strategy | Closure>",
                      "time_range": "<e.g. 0-3 min>",
                      "objective": "<what to achieve in this phase>",
                      "key_messages": ["<message 1>", "<message 2>"],
                      "suggested_phrasing": "<example opening line or phrasing for this phase>"
                    }
                  ],
                  "next_actions": [
                    {
                      "action": "<concrete follow-up action>",
                      "owner": "<suggested owner or role>",
                      "timeframe": "<immediate | short_term | medium_term | long_term>",
                      "priority": "<High | Medium | Low>"
                    }
                  ]
                }
                """.formatted(
                        customerName != null ? customerName : "Unknown",
                        meetingContext != null ? meetingContext : "",
                        previousMeetingSection,
                        problemDocument,
                        formattedContextDocuments,
                        contextChangesInstruction);
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

