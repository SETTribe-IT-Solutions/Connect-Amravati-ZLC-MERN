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
import com.tribe.set.dto.GlobalStatsDTO;
import com.tribe.set.dto.PerformanceReportDTO;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/performance")
    @PreAuthorize("authenticated")
    public ResponseEntity<List<PerformanceReportDTO>> getPerformanceReport(
            @RequestParam(name = "requesterId") String requesterId) {
        return ResponseEntity.ok(reportService.getPerformanceReport(requesterId));
    }

    @GetMapping("/global-stats")
    @PreAuthorize("authenticated")
    public ResponseEntity<GlobalStatsDTO> getGlobalStats(@RequestParam(name = "requesterId") String requesterId) {
        return ResponseEntity.ok(reportService.getGlobalStats(requesterId));
    }
}
