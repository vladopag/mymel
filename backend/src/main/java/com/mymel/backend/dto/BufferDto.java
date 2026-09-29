package com.mymel.backend.dto;

public class BufferDto {
    private String type = "Buffer";
    private int[] data;

    public BufferDto() {
    }

    public BufferDto(int[] data) {
        this.type = "Buffer";
        this.data = data;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int[] getData() {
        return data;
    }

    public void setData(int[] data) {
        this.data = data;
    }
}
