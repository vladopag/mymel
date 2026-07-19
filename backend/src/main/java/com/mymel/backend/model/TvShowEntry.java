package com.mymel.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TV_SHOW")
public class TvShowEntry extends MediaEntry {

    private Integer episodesWatched = 0;
    private Integer totalEpisodes;

    public Integer getEpisodesWatched() { return episodesWatched; }
    public void setEpisodesWatched(Integer episodesWatched) { this.episodesWatched = episodesWatched; }

    public Integer getTotalEpisodes() { return totalEpisodes; }
    public void setTotalEpisodes(Integer totalEpisodes) { this.totalEpisodes = totalEpisodes; }
}
