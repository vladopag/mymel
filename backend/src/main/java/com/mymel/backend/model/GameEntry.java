package com.mymel.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("GAME")
public class GameEntry extends MediaEntry {

    private String platform;

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
}
