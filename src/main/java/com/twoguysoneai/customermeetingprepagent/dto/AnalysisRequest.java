package com.twoguysoneai.customermeetingprepagent.dto;

import java.util.List;

public class AnalysisRequest {

    private String customerName;
    private String meetingContext;
    private String previousMeetingNotes;
    private String problemUrl;
    private List<String> contextUrls;

    public AnalysisRequest() {}

    public AnalysisRequest(String customerName, String meetingContext, String previousMeetingNotes, String problemUrl, List<String> contextUrls) {
        this.customerName = customerName;
        this.meetingContext = meetingContext;
        this.previousMeetingNotes = previousMeetingNotes;
        this.problemUrl = problemUrl;
        this.contextUrls = contextUrls;
    }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getMeetingContext() { return meetingContext; }
    public void setMeetingContext(String meetingContext) { this.meetingContext = meetingContext; }

    public String getPreviousMeetingNotes() { return previousMeetingNotes; }
    public void setPreviousMeetingNotes(String previousMeetingNotes) { this.previousMeetingNotes = previousMeetingNotes; }

    public String getProblemUrl() { return problemUrl; }
    public void setProblemUrl(String problemUrl) { this.problemUrl = problemUrl; }

    public List<String> getContextUrls() { return contextUrls; }
    public void setContextUrls(List<String> contextUrls) { this.contextUrls = contextUrls; }
}
