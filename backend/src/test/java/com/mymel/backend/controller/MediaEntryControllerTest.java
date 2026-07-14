package com.mymel.backend.controller;

import com.mymel.backend.model.MediaEntry;
import com.mymel.backend.model.MediaStatus;
import com.mymel.backend.model.MediaType;
import com.mymel.backend.repository.MediaEntryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

    @Test
    public void testCreateAndGetMediaEntry() throws Exception {
        // Clear repo
        repository.deleteAll();

        // 1. Create a new entry via POST
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

        // 2. Retrieve the entries via GET
        mockMvc.perform(get("/api/v1/media"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Steins;Gate"))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"));
    }
}
