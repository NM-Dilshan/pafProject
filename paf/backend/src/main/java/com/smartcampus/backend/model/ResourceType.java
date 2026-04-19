package com.smartcampus.backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum ResourceType {
    LECTURE_HALL,
    LAB,
    STUDY_AREA

    ;

    @JsonCreator
    public static ResourceType fromValue(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Resource type is required");
        }

        String normalized = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');

        if ("LABORATORY".equals(normalized)) {
            return LAB;
        }

        return ResourceType.valueOf(normalized);
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}