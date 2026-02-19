package com.impactlink.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private String beneficiaryTarget;

    @ElementCollection
    @CollectionTable(name = "project_sdg", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "sdg_code")
    private List<String> sdgTargets;
}
