package com.mymel.backend.repository;

import com.mymel.backend.model.MediaEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MediaEntryRepository extends JpaRepository<MediaEntry, Long> {
}
