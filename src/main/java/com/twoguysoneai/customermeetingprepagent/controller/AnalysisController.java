package com.twoguysoneai.customermeetingprepagent.controller;

import com.twoguysoneai.customermeetingprepagent.dto.AnalysisRequest;
import com.twoguysoneai.customermeetingprepagent.dto.AnalysisResponse;
import com.twoguysoneai.customermeetingprepagent.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping
    public ResponseEntity<AnalysisResponse> analyze(@RequestBody AnalysisRequest request) {
        String output = analysisService.analyze(request.getProblemUrl(), request.getContextUrl());
        return ResponseEntity.ok(new AnalysisResponse(output));
    }
}

