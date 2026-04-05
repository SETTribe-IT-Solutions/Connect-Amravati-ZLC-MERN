package com.tribe.set.service;

import java.util.stream.Collectors;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.dto.TalukaDTO;
import com.tribe.set.dto.VillageDTO;
import com.tribe.set.entity.Role;
import com.tribe.set.repository.TalukaVillageRepository;
import com.tribe.set.repository.UserRepository;

@Service
public class TalukaVillageService {

    @Autowired
    private TalukaVillageRepository repository;

    @Autowired
    private UserRepository userRepository;

    public List<TalukaDTO> getAllTalukas() {
        return repository.findDistinctTalukas()
                .stream()
                .map(TalukaDTO::new)
                .collect(Collectors.toList());
    }

    public List<VillageDTO> getVillagesByTaluka(String taluka) {
        return repository.findVillagesByTaluka(taluka)
                .stream()
                .map(VillageDTO::new)
                .collect(Collectors.toList());
    }

    public List<TalukaDTO> getTalukasByRole(Role role) {
        return userRepository.findDistinctTalukasByRole(role)
                .stream()
                .map(TalukaDTO::new)
                .collect(Collectors.toList());
    }

    public List<VillageDTO> getVillagesByRoleAndTaluka(Role role, String taluka) {
        return userRepository.findDistinctVillagesByRoleAndTaluka(role, taluka)
                .stream()
                .map(VillageDTO::new)
                .collect(Collectors.toList());
    }
}