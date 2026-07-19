package com.mymel.backend.controller;

import com.mymel.backend.model.MediaEntry;
import com.mymel.backend.model.AnimeEntry;
import com.mymel.backend.model.MovieEntry;
import com.mymel.backend.model.TvShowEntry;
import com.mymel.backend.model.GameEntry;
import com.mymel.backend.model.BookEntry;
import com.mymel.backend.model.User;
import com.mymel.backend.repository.MediaEntryRepository;
import com.mymel.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/media")
public class MediaEntryController {

    @Autowired
    private MediaEntryRepository mediaEntryRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @GetMapping
    public List<MediaEntry> getAllMediaEntries() {
        return mediaEntryRepository.findByUser(getAuthenticatedUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaEntry> getMediaEntryById(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();
        Optional<MediaEntry> mediaEntry = mediaEntryRepository.findById(id);
        if (mediaEntry.isPresent() && mediaEntry.get().getUser().equals(currentUser)) {
            return ResponseEntity.ok(mediaEntry.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<MediaEntry> createMediaEntry(@RequestBody MediaEntry mediaEntry) {
        mediaEntry.setUser(getAuthenticatedUser());
        MediaEntry savedEntry = mediaEntryRepository.save(mediaEntry);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEntry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MediaEntry> updateMediaEntry(@PathVariable Long id, @RequestBody MediaEntry mediaEntryDetails) {
        User currentUser = getAuthenticatedUser();
        return mediaEntryRepository.findById(id)
                .map(existingEntry -> {
                    if (!existingEntry.getUser().equals(currentUser)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<MediaEntry>build();
                    }
                    existingEntry.setTitle(mediaEntryDetails.getTitle());
                    existingEntry.setStatus(mediaEntryDetails.getStatus());
                    existingEntry.setRating(mediaEntryDetails.getRating());
                    existingEntry.setReview(mediaEntryDetails.getReview());
                    existingEntry.setReleaseDate(mediaEntryDetails.getReleaseDate());
                    existingEntry.setCoverImageUrl(mediaEntryDetails.getCoverImageUrl());
                    existingEntry.setPersonalNotes(mediaEntryDetails.getPersonalNotes());

                    if (existingEntry instanceof AnimeEntry && mediaEntryDetails instanceof AnimeEntry) {
                        AnimeEntry e = (AnimeEntry) existingEntry;
                        AnimeEntry d = (AnimeEntry) mediaEntryDetails;
                        e.setEpisodesWatched(d.getEpisodesWatched());
                        e.setTotalEpisodes(d.getTotalEpisodes());
                    } else if (existingEntry instanceof TvShowEntry && mediaEntryDetails instanceof TvShowEntry) {
                        TvShowEntry e = (TvShowEntry) existingEntry;
                        TvShowEntry d = (TvShowEntry) mediaEntryDetails;
                        e.setEpisodesWatched(d.getEpisodesWatched());
                        e.setTotalEpisodes(d.getTotalEpisodes());
                    } else if (existingEntry instanceof MovieEntry && mediaEntryDetails instanceof MovieEntry) {
                        MovieEntry e = (MovieEntry) existingEntry;
                        MovieEntry d = (MovieEntry) mediaEntryDetails;
                        e.setDurationMinutes(d.getDurationMinutes());
                    } else if (existingEntry instanceof GameEntry && mediaEntryDetails instanceof GameEntry) {
                        GameEntry e = (GameEntry) existingEntry;
                        GameEntry d = (GameEntry) mediaEntryDetails;
                        e.setPlatform(d.getPlatform());
                    } else if (existingEntry instanceof BookEntry && mediaEntryDetails instanceof BookEntry) {
                        BookEntry e = (BookEntry) existingEntry;
                        BookEntry d = (BookEntry) mediaEntryDetails;
                        e.setPagesRead(d.getPagesRead());
                        e.setTotalPages(d.getTotalPages());
                    }
                    MediaEntry updatedEntry = mediaEntryRepository.save(existingEntry);
                    return ResponseEntity.ok(updatedEntry);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMediaEntry(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();
        Optional<MediaEntry> mediaEntry = mediaEntryRepository.findById(id);
        if (mediaEntry.isPresent()) {
            MediaEntry entry = mediaEntry.get();
            if (!entry.getUser().equals(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            mediaEntryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
