package com.mymel.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("ANIME")
public class AnimeEntry extends MediaEntry {

}
