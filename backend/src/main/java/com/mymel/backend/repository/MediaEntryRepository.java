package com.mymel.backend.repository;

import com.mymel.backend.model.MediaEntry;
import com.mymel.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MediaEntryRepository extends JpaRepository<MediaEntry, Long> {
    List<MediaEntry> findByUser(User user);
}
