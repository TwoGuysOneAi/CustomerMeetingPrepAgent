package com.twoguysoneai.customermeetingprepagent.dto;

public class AnalysisResponse {

    private String output;

    public AnalysisResponse() {}

    public AnalysisResponse(String output) {
        this.output = output;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }
}

