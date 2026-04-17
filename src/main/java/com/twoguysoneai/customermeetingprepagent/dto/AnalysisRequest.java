package com.twoguysoneai.customermeetingprepagent.dto;

public class AnalysisRequest {

    private String problemUrl;
    private String contextUrl;

    public AnalysisRequest() {}

    public AnalysisRequest(String problemUrl, String contextUrl) {
        this.problemUrl = problemUrl;
        this.contextUrl = contextUrl;
    }

    public String getProblemUrl() {
        return problemUrl;
    }

    public void setProblemUrl(String problemUrl) {
        this.problemUrl = problemUrl;
    }

    public String getContextUrl() {
        return contextUrl;
    }

    public void setContextUrl(String contextUrl) {
        this.contextUrl = contextUrl;
    }
}

