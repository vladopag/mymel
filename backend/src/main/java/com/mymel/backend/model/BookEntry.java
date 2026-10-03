package com.mymel.backend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("BOOK")
public class BookEntry extends MediaEntry {

    private String author;

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
}
