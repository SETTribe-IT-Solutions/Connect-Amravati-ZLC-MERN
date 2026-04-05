//package com.tribe.set.controller;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.tribe.set.dto.DefaultLocation;
//import com.tribe.set.service.TalukaVillageService;

//@RestController
//@RequestMapping("/api")
//@CrossOrigin("*") // frontend connect sathi
//public class TalukaVillageController {
//
//    @Autowired
//    private TalukaVillageService service;
//
//    // ✅ Get all talukas
//    @GetMapping("/talukas")
//    public List<String> getTalukas() {
//        return service.getAllTalukas();
//    }
//
//    // ✅ Get villages by taluka
//    @GetMapping("/villages/{taluka}")
//    public List<String> getVillages(@PathVariable String taluka) {
//        return service.getVillagesByTaluka(taluka);
//    }
//    
//    
//    @GetMapping("/default-location")
//    public Map<String, String> getDefaultLocation() {
//        Map<String, String> map = new HashMap<>();
//        map.put("taluka", "Khamgaon");
//        map.put("village", "Village1");
//        return map;
//    }
//}
//
//@RestController
//@RequestMapping("/api")
//@CrossOrigin(origins = "http://localhost:3000") // only frontend URL allow
//public class TalukaVillageController {
//
//    @Autowired
//    private TalukaVillageService service;
//
//    // Get all talukas
//    @GetMapping("/talukas")
//    public List<String> getTalukas() {
//        return service.getAllTalukas();
//    }
//
//    // Get villages by taluka
//    @GetMapping("/villages/{taluka}")
//    public List<String> getVillages(@PathVariable String taluka) {
//        return service.getVillagesByTaluka(taluka);
//    }
//
//    // ✅ No Map — use simple DTO
//    @GetMapping("/default-location")
//    public DefaultLocation getDefaultLocation() {
//        return new DefaultLocation("Khamgaon", "Village1");
//    }
//}


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
@CrossOrigin(origins = "http://localhost:5173") // only frontend allowed
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

