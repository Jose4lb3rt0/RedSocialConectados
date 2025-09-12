package org.jose.backend.utils;

import java.text.Normalizer;

public class Slugs {
    public Slugs() {}

    public static String slugify(String raw) {
        if (raw == null || raw.length() == 0) return "user";

        String s = Normalizer.normalize(raw, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9.]+", ".")   // solo letras/números y puntos
                .replaceAll("\\.{2,}", ".")       // colapsa puntos
                .replaceAll("^\\.|\\.$", "");     // sin punto al inicio/fin
        return s.isBlank() ? "user" : s;
    }
}
