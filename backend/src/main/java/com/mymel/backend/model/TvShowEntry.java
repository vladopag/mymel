package com.mymel.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TV_SHOW")
public class TvShowEntry extends MediaEntry {

}
