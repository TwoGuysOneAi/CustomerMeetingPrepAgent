package com.twoguysoneai.customermeetingprepagent.dto;

import java.util.List;

public class AnalysisRequest {

    private String problemUrl;
    private List<String> contextUrls;

    public AnalysisRequest() {}

    public AnalysisRequest(String problemUrl, List<String> contextUrls) {
        this.problemUrl = problemUrl;
        this.contextUrls = contextUrls;
    }

    public String getProblemUrl() {
        return problemUrl;
    }

    public void setProblemUrl(String problemUrl) {
        this.problemUrl = problemUrl;
    }

    public List<String> getContextUrls() {
        return contextUrls;
    }

    public void setContextUrls(List<String> contextUrls) {
        this.contextUrls = contextUrls;
    }
}

