package com.mymel.backend.controller;

import com.mymel.backend.model.AnimeEntry;
import com.mymel.backend.model.MediaStatus;
import com.mymel.backend.model.MovieEntry;
import com.mymel.backend.model.User;
import com.mymel.backend.model.UserRole;
import com.mymel.backend.repository.MediaEntryRepository;
import com.mymel.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class MediaEntryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MediaEntryRepository repository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    public void setUp() {
        repository.deleteAll();
        userRepository.deleteAll();

        testUser = new User("testuser", "test@mymel.com", "password", UserRole.USER);
        userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testCreateAndGetMediaEntry() throws Exception {
        String requestJson = """
                {
                    "title": "Steins;Gate",
                    "type": "ANIME",
                    "status": "COMPLETED",
                    "rating": 10,
                    "review": "El Psy Kongroo"
                }
                """;

        mockMvc.perform(post("/api/v1/media")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Steins;Gate"))
                .andExpect(jsonPath("$.type").value("ANIME"));

        mockMvc.perform(get("/api/v1/media"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Steins;Gate"))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testQuickTrackEpisodesIncrementAndDecrement() throws Exception {
        AnimeEntry anime = new AnimeEntry();
        anime.setTitle("Fren");
        anime.setStatus(MediaStatus.WATCHING);
        anime.setRating(9);
        anime.setEpisodesWatched(10);
        anime.setTotalEpisodes(24);
        anime.setUser(testUser);
        AnimeEntry saved = repository.save(anime);

        // Increment episode count by 1
        mockMvc.perform(patch("/api/v1/media/" + saved.getId() + "/episodes").param("delta", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.episodesWatched").value(11));

        // Decrement episode count by 1
        mockMvc.perform(patch("/api/v1/media/" + saved.getId() + "/episodes").param("delta", "-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.episodesWatched").value(10));
    }

    @Test
    @WithMockUser(username = "testuser")
    public void testQuickTrackEpisodesInvalidMediaType() throws Exception {
        MovieEntry movie = new MovieEntry();
        movie.setTitle("Inception");
        movie.setStatus(MediaStatus.COMPLETED);
        movie.setRating(10);
        movie.setDurationMinutes(148);
        movie.setUser(testUser);
        MovieEntry saved = repository.save(movie);

        mockMvc.perform(patch("/api/v1/media/" + saved.getId() + "/episodes").param("delta", "1"))
                .andExpect(status().isBadRequest());
    }
}
