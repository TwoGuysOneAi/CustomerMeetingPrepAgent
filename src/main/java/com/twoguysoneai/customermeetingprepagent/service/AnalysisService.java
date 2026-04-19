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

    public String analyze(String problemUrl, List<String> contextUrls) {
        if (contextUrls == null || contextUrls.isEmpty()) {
            throw new IllegalArgumentException("contextUrls must contain at least one URL");
        }

        String problemDocument = cleanForLlm(documentService.fetchProblemDocument(problemUrl));
        List<String> contextDocuments = contextUrls.stream()
                .map(documentService::fetchContextDocument)
                .map(this::cleanForLlm)
                .toList();
        String prompt = buildPrompt(problemDocument, contextDocuments);
        return llmClient.call(prompt);
    }

    private String buildPrompt(String problemDocument, List<String> contextDocuments) {
        String formattedContextDocuments = formatContextDocuments(contextDocuments);

        return """
                You are a solution analyst. Analyze the documents below and provide a structured response.

                === PROBLEM ===
                %s

                === CONTEXT ===
                %s

                Produce your response in exactly the following sections:

                1. Problem Summary
                   A concise summary of the core problem.

                2. Key Challenges
                   A bulleted list of the main challenges identified.

                3. Mapping of Features to Problem
                   For each feature in the context document, explain how it relates to the problem.

                4. Proposed Solution
                   A clear, actionable solution recommendation.

                5. Risks / Gaps
                   Known risks or missing information that could affect the solution.
                """.formatted(problemDocument, formattedContextDocuments);
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

