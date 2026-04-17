package com.twoguysoneai.customermeetingprepagent.service;

import org.springframework.stereotype.Service;

@Service
public class DocumentService {

    /**
     * Fetches the problem document for the given URL.
     * URL-based fetching can be wired in here later without changing callers.
     */
    public String fetchProblemDocument(String problemUrl) {
        return "DUMMY PROBLEM DOCUMENT";
    }

    /**
     * Fetches the context/feature document for the given URL.
     * URL-based fetching can be wired in here later without changing callers.
     */
    public String fetchContextDocument(String contextUrl) {
        return "DUMMY FEATURE / CONTEXT DOCUMENT";
    }
}

