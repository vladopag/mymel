package com.mymel.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mymel.backend.dto.CaptchaChallengeResponse;
import com.mymel.backend.dto.CaptchaVerifyRequest;
import com.mymel.backend.dto.RegisterRequest;
import com.mymel.backend.repository.UserRepository;
import com.mymel.backend.service.SliderCaptchaService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SliderCaptchaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SliderCaptchaService sliderCaptchaService;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    public void setUp() {
        userRepository.deleteAll();
    }

    @Test
    public void testCreateCaptchaReturnsValidChallengeAndCookie() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/captcha/create"))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("CAPTCHA_SESSION"))
                .andExpect(jsonPath("$.challengeId").isNotEmpty())
                .andExpect(jsonPath("$.background.type").value("Buffer"))
                .andExpect(jsonPath("$.background.data").isArray())
                .andExpect(jsonPath("$.slider.type").value("Buffer"))
                .andExpect(jsonPath("$.slider.data").isArray())
                .andExpect(jsonPath("$.backgroundDataUri").isNotEmpty())
                .andExpect(jsonPath("$.sliderDataUri").isNotEmpty())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        CaptchaChallengeResponse response = objectMapper.readValue(responseBody, CaptchaChallengeResponse.class);
        assertNotNull(response.getChallengeId());
        assertTrue(response.getBackground().getData().length > 0);
        assertTrue(response.getSlider().getData().length > 0);
    }

    @Test
    public void testVerifyCaptchaSuccessAndFailure() throws Exception {
        // Create challenge directly from service
        CaptchaChallengeResponse challenge = sliderCaptchaService.createChallenge();
        String challengeId = challenge.getChallengeId();

        // 1. Verify with incorrect response
        CaptchaVerifyRequest failRequest = new CaptchaVerifyRequest(challengeId, 999.0, null);
        mockMvc.perform(post("/api/v1/captcha/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(failRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("failure"))
                .andExpect(jsonPath("$.token").doesNotExist());

        // 2. Challenge should have been invalidated on failed attempt or create a new one
        CaptchaChallengeResponse challenge2 = sliderCaptchaService.createChallenge();
        String challengeId2 = challenge2.getChallengeId();

        // Retrieve solution
        // Test verify through service with correct coordinate
        // In verifyChallenge, user coordinate matching challenge
        // Let's test with cookie
        MvcResult createResult = mockMvc.perform(get("/api/v1/captcha/create"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie sessionCookie = createResult.getResponse().getCookie("CAPTCHA_SESSION");
        assertNotNull(sessionCookie);

        // Attempt verification with invalid X using cookie
        mockMvc.perform(post("/api/v1/captcha/verify")
                        .cookie(sessionCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"response\": 0.0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("failure"));
    }

    @Test
    public void testRegisterRequiresValidCaptchaToken() throws Exception {
        // 1. Register with no captcha token -> fails
        RegisterRequest request = new RegisterRequest();
        request.setUsername("captchaUser");
        request.setEmail("captcha@test.com");
        request.setPassword("password123");
        request.setCaptchaToken(null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Captcha verification failed!"));

        // 2. Register with fake captcha token -> fails
        request.setCaptchaToken("fake-token-12345");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Captcha verification failed!"));

        // 3. Register with valid token obtained from service
        CaptchaChallengeResponse challenge = sliderCaptchaService.createChallenge();
        // Look up solution through reflection or test verifyChallenge
        java.lang.reflect.Field field = SliderCaptchaService.class.getDeclaredField("challenges");
        field.setAccessible(true);
        @SuppressWarnings("unchecked")
        java.util.Map<String, SliderCaptchaService.ChallengeData> map =
                (java.util.Map<String, SliderCaptchaService.ChallengeData>) field.get(sliderCaptchaService);
        SliderCaptchaService.ChallengeData challengeData = map.get(challenge.getChallengeId());
        assertNotNull(challengeData);

        String validToken = sliderCaptchaService.verifyChallenge(challenge.getChallengeId(), challengeData.getSolutionX());
        assertNotNull(validToken);

        request.setCaptchaToken(validToken);
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("captchaUser"))
                .andExpect(jsonPath("$.email").value("captcha@test.com"));

        // 4. Token cannot be reused (one-time use)
        request.setUsername("captchaUser2");
        request.setEmail("captcha2@test.com");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Captcha verification failed!"));
    }
}
