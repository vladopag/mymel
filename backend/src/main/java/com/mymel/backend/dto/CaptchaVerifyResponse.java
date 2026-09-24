package com.mymel.backend.dto;

public class CaptchaVerifyResponse {
    private String result;
    private String token;

    public CaptchaVerifyResponse() {
    }

    public CaptchaVerifyResponse(String result, String token) {
        this.result = result;
        this.token = token;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
