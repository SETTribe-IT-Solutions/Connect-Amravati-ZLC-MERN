package com.tribe.set.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tribe.set.Entity.TalukaVillage;

public interface TalukaVillageRepository extends JpaRepository<TalukaVillage, Long> {

    // Get all unique talukas
    @Query("SELECT DISTINCT t.tName FROM TalukaVillage t")
    List<String> findDistinctTalukas();

    // Get villages by taluka
    @Query("SELECT t.vName FROM TalukaVillage t WHERE t.tName = :taluka")
    List<String> findVillagesByTaluka(@Param("taluka") String taluka);
}
