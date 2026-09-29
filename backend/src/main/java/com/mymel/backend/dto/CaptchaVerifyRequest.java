package com.mymel.backend.dto;

import java.util.Map;

public class CaptchaVerifyRequest {
    private String challengeId;
    private Double response;
    private Map<String, Object> trail;

    public CaptchaVerifyRequest() {
    }

    public CaptchaVerifyRequest(String challengeId, Double response, Map<String, Object> trail) {
        this.challengeId = challengeId;
        this.response = response;
        this.trail = trail;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public Double getResponse() {
        return response;
    }

    public void setResponse(Double response) {
        this.response = response;
    }

    public Map<String, Object> getTrail() {
        return trail;
    }

    public void setTrail(Map<String, Object> trail) {
        this.trail = trail;
    }
}
