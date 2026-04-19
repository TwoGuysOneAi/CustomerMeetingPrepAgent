package com.twoguysoneai.customermeetingprepagent.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Message {

    @JsonProperty("role")
    private String role;

    @JsonProperty("author")
    private String author;

    @JsonProperty("content")
    private String content;

    public Message() {}

    public Message(String role, String author, String content) {
        this.role = role;
        this.author = author;
        this.content = content;
    }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

