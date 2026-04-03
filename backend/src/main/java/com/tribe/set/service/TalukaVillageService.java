package com.tribe.set.service;

import java.util.stream.Collectors;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.dto.TalukaDTO;
import com.tribe.set.dto.VillageDTO;
import com.tribe.set.repository.TalukaVillageRepository;

@Service
public class TalukaVillageService {

    @Autowired
    private TalukaVillageRepository repository;

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
}