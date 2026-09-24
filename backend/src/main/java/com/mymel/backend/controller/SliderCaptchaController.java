package com.mymel.backend.controller;

import com.mymel.backend.dto.CaptchaChallengeResponse;
import com.mymel.backend.dto.CaptchaVerifyRequest;
import com.mymel.backend.dto.CaptchaVerifyResponse;
import com.mymel.backend.service.SliderCaptchaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/captcha")
public class SliderCaptchaController {

    @Autowired
    private SliderCaptchaService sliderCaptchaService;

    @GetMapping("/create")
    public ResponseEntity<CaptchaChallengeResponse> createCaptcha() {
        CaptchaChallengeResponse challenge = sliderCaptchaService.createChallenge();

        ResponseCookie cookie = ResponseCookie.from("CAPTCHA_SESSION", challenge.getChallengeId())
                .path("/")
                .httpOnly(true)
                .sameSite("Lax")
                .maxAge(120)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(challenge);
    }

    @PostMapping("/verify")
    public ResponseEntity<CaptchaVerifyResponse> verifyCaptcha(
            @RequestBody(required = false) CaptchaVerifyRequest verifyRequest,
            @CookieValue(name = "CAPTCHA_SESSION", required = false) String cookieChallengeId
    ) {
        if (verifyRequest == null) {
            return ResponseEntity.ok(new CaptchaVerifyResponse("failure", null));
        }

        String challengeId = verifyRequest.getChallengeId();
        if (challengeId == null || challengeId.isBlank()) {
            challengeId = cookieChallengeId;
        }

        Double response = verifyRequest.getResponse();
        if (challengeId == null || response == null) {
            return ResponseEntity.ok(new CaptchaVerifyResponse("failure", null));
        }

        String token = sliderCaptchaService.verifyChallenge(challengeId, response);
        if (token != null) {
            return ResponseEntity.ok(new CaptchaVerifyResponse("success", token));
        } else {
            return ResponseEntity.ok(new CaptchaVerifyResponse("failure", null));
        }
    }
}
