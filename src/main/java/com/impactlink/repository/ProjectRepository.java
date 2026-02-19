package com.impactlink.repository;

import com.impactlink.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // UPDATED: Finds ANYTHING nearby (0.01 degrees approx 1km)
    // We removed the strict SDG filter so the Java Logic can decide match/no-match
    @Query(value = """
        SELECT DISTINCT p.*
        FROM Project p
        WHERE p.id <> :excludeId
          AND (
            POWER(p.latitude - :lat, 2) + 
            POWER(p.longitude - :lon, 2)
          ) < 0.01
        """, nativeQuery = true)
    List<Project> findNearbyProjectsWithSharedSdgs(
        @Param("lat") double latitude,
        @Param("lon") double longitude,
        @Param("excludeId") Long excludeProjectId
    );
}
