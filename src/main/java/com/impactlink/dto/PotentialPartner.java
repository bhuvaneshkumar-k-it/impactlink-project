package com.impactlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PotentialPartner {
    private Long projectId;
    private String projectName;
    private Double duplicationScore;
    private List<String> sharedSdgTargets;
    private Double textSimilarityScore;
}
