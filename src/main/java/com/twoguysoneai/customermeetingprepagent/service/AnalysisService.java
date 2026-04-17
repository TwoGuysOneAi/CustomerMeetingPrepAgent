package com.twoguysoneai.customermeetingprepagent.service;

import org.springframework.stereotype.Service;

@Service
public class AnalysisService {

    private final DocumentService documentService;
    private final LLMClient llmClient;

    public AnalysisService(DocumentService documentService, LLMClient llmClient) {
        this.documentService = documentService;
        this.llmClient = llmClient;
    }

    public String analyze(String problemUrl, String contextUrl) {
        String problemDocument = documentService.fetchProblemDocument(problemUrl);
        String contextDocument = documentService.fetchContextDocument(contextUrl);
        String prompt = buildPrompt(problemDocument, contextDocument);
        return llmClient.call(prompt);
    }

    private String buildPrompt(String problemDocument, String contextDocument) {
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
                """.formatted(problemDocument, contextDocument);
    }
}

