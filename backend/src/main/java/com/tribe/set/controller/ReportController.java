package com.tribe.set.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tribe.set.service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/performance")
    public ResponseEntity<List<Map<String, Object>>> getPerformanceReport(
            @RequestParam(name = "requesterId") String requesterId) {
        return ResponseEntity.ok(reportService.getPerformanceReport(requesterId));
    }

    @GetMapping("/global-stats")
    public ResponseEntity<Map<String, Object>> getGlobalStats(@RequestParam(name = "requesterId") String requesterId) {
        return ResponseEntity.ok(reportService.getGlobalStats(requesterId));
    }
}
