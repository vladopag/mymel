package com.mymel.backend.dto;

public class CaptchaChallengeResponse {
    private String challengeId;
    private BufferDto background;
    private BufferDto slider;
    private String backgroundDataUri;
    private String sliderDataUri;
    private int yOffset;

    public CaptchaChallengeResponse() {
    }

    public CaptchaChallengeResponse(String challengeId, BufferDto background, BufferDto slider, String backgroundDataUri, String sliderDataUri, int yOffset) {
        this.challengeId = challengeId;
        this.background = background;
        this.slider = slider;
        this.backgroundDataUri = backgroundDataUri;
        this.sliderDataUri = sliderDataUri;
        this.yOffset = yOffset;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public BufferDto getBackground() {
        return background;
    }

    public void setBackground(BufferDto background) {
        this.background = background;
    }

    public BufferDto getSlider() {
        return slider;
    }

    public void setSlider(BufferDto slider) {
        this.slider = slider;
    }

    public String getBackgroundDataUri() {
        return backgroundDataUri;
    }

    public void setBackgroundDataUri(String backgroundDataUri) {
        this.backgroundDataUri = backgroundDataUri;
    }

    public String getSliderDataUri() {
        return sliderDataUri;
    }

    public void setSliderDataUri(String sliderDataUri) {
        this.sliderDataUri = sliderDataUri;
    }

    public int getyOffset() {
        return yOffset;
    }

    public void setyOffset(int yOffset) {
        this.yOffset = yOffset;
    }
}
