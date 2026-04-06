package com.tribe.set.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.tribe.set.dto.TalukaDTO;
import com.tribe.set.dto.VillageDTO;
import com.tribe.set.entity.Role;
import com.tribe.set.service.TalukaVillageService;

@RestController
@RequestMapping("/api")
@CrossOrigin("*") 
public class TalukaVillageController {

    @Autowired
    private TalukaVillageService service;

    @GetMapping("/talukas")
    public List<TalukaDTO> getTalukas(@RequestParam(required = false) Role role) {
        if (role != null) {
            return service.getTalukasByRole(role);
        }
        return service.getAllTalukas();
    }

    @GetMapping("/villages/{taluka}")
    public List<VillageDTO> getVillages(
            @PathVariable String taluka,
            @RequestParam(required = false) Role role) {
        if (role != null) {
            return service.getVillagesByRoleAndTaluka(role, taluka);
        }
        return service.getVillagesByTaluka(taluka);
    }
}

