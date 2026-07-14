package com.mymel.backend.controller;

import com.mymel.backend.model.MediaEntry;
import com.mymel.backend.repository.MediaEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/media")
@CrossOrigin(origins = "*") // Allow frontend to communicate
public class MediaEntryController {

    @Autowired
    private MediaEntryRepository mediaEntryRepository;

    @GetMapping
    public List<MediaEntry> getAllMediaEntries() {
        return mediaEntryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaEntry> getMediaEntryById(@PathVariable Long id) {
        Optional<MediaEntry> mediaEntry = mediaEntryRepository.findById(id);
        return mediaEntry.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MediaEntry> createMediaEntry(@RequestBody MediaEntry mediaEntry) {
        MediaEntry savedEntry = mediaEntryRepository.save(mediaEntry);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEntry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MediaEntry> updateMediaEntry(@PathVariable Long id, @RequestBody MediaEntry mediaEntryDetails) {
        return mediaEntryRepository.findById(id)
                .map(existingEntry -> {
                    existingEntry.setTitle(mediaEntryDetails.getTitle());
                    existingEntry.setType(mediaEntryDetails.getType());
                    existingEntry.setStatus(mediaEntryDetails.getStatus());
                    existingEntry.setRating(mediaEntryDetails.getRating());
                    existingEntry.setReview(mediaEntryDetails.getReview());
                    existingEntry.setReleaseDate(mediaEntryDetails.getReleaseDate());
                    existingEntry.setCoverImageUrl(mediaEntryDetails.getCoverImageUrl());
                    existingEntry.setPersonalNotes(mediaEntryDetails.getPersonalNotes());
                    MediaEntry updatedEntry = mediaEntryRepository.save(existingEntry);
                    return ResponseEntity.ok(updatedEntry);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMediaEntry(@PathVariable Long id) {
        if (mediaEntryRepository.existsById(id)) {
            mediaEntryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
