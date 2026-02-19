package com.impactlink.service;

import com.impactlink.dto.PotentialPartner;
import com.impactlink.entity.Project;
import com.impactlink.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DuplicationDetectionService {

    @Autowired
    private ProjectRepository projectRepository;

    public List<PotentialPartner> findPotentialPartners(Project inputProject) {
        // 1. Fetch ALL neighbors
        List<Project> nearbyProjects = projectRepository.findNearbyProjectsWithSharedSdgs(
                inputProject.getLatitude(),
                inputProject.getLongitude(),
                inputProject.getId() != null ? inputProject.getId() : -1L
        );

        List<PotentialPartner> potentialPartners = new ArrayList<>();

        for (Project existing : nearbyProjects) {
            // STRICT MODE: Start Score = 0 (No free points for just being nearby)
            double duplicationScore = 0.0;

            // 2. SDG Match (+40 Points)
            List<String> sharedSdgs = new ArrayList<>();
            if (inputProject.getSdgTargets() != null && existing.getSdgTargets() != null) {
                sharedSdgs = inputProject.getSdgTargets().stream()
                        .filter(code -> existing.getSdgTargets().contains(code))
                        .collect(Collectors.toList());
            }
            if (!sharedSdgs.isEmpty()) duplicationScore += 40; 

            // 3. AI NLP Score (+60 Points Max)
            double textSimilarity = calculateJaccardSimilarity(inputProject.getDescription(), existing.getDescription());
            duplicationScore += (textSimilarity * 60);

            // 4. KEYWORD BOOSTER (Context Awareness)
            String inputTxt = (inputProject.getName() + " " + inputProject.getDescription()).toLowerCase();
            String dbTxt = (existing.getName() + " " + existing.getDescription()).toLowerCase();

            if ((inputTxt.contains("handicap") || inputTxt.contains("disab")) && 
                (dbTxt.contains("handicap") || dbTxt.contains("disab"))) duplicationScore += 40;
            
            if ((inputTxt.contains("girl") || inputTxt.contains("women")) && 
                (dbTxt.contains("girl") || dbTxt.contains("women"))) duplicationScore += 30;
            
            if ((inputTxt.contains("water") || inputTxt.contains("ocean") || inputTxt.contains("fish")) && 
                (dbTxt.contains("water") || dbTxt.contains("ocean") || dbTxt.contains("fish"))) duplicationScore += 30;

            // 5. THRESHOLD: Only show if Score > 25 (Filters out unrelated neighbors)
            if (duplicationScore > 25) {
                if (duplicationScore > 99) duplicationScore = 99;
                potentialPartners.add(new PotentialPartner(
                        existing.getId(), existing.getName(),
                        Math.round(duplicationScore * 10.0) / 10.0,
                        sharedSdgs, textSimilarity
                ));
            }
        }
        return potentialPartners;
    }

    private double calculateJaccardSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        Set<String> set1 = new HashSet<>(Arrays.asList(s1.toLowerCase().replaceAll("[^a-zA-Z ]", "").split("\\s+")));
        Set<String> set2 = new HashSet<>(Arrays.asList(s2.toLowerCase().replaceAll("[^a-zA-Z ]", "").split("\\s+")));
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        return (double) intersection.size() / union.size();
    }
}
