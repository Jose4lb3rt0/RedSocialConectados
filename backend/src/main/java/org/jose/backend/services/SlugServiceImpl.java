package org.jose.backend.services;

import org.jose.backend.repository.UsuarioRepository;
import org.jose.backend.utils.Slugs;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class SlugServiceImpl implements SlugService {

    private static final int MAX_LEN = 100;
    private static final int BASE_MAX = 90; // deja espacio para sufijos
    private static final Set<String> RESERVED = Set.of(
            "login","register","u","profile","api","admin","me","settings","posts"
    );

    private final UsuarioRepository usuarioRepository;

    public SlugServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public String generate(String name, String surname) {
        String base = Slugs.slugify((name == null ? "" : name) + "." + (surname == null ? "" : surname));
        if (base.length() > BASE_MAX) base = base.substring(0, BASE_MAX).replaceAll("\\.$", "");

        String candidate = base;
        if (isTakenOrReserved(candidate)) {
            int n = 1;
            while (true) {
                String suffix = "." + n;
                int maxBase = Math.max(1, MAX_LEN - suffix.length());
                String trimmedBase = candidate.length() > maxBase ? candidate.substring(0, maxBase) : candidate;
                String next = (trimmedBase + suffix).replaceAll("\\.{2,}", ".").replaceAll("\\.$", "");
                if (!isTakenOrReserved(next)) {
                    candidate = next;
                    break;
                }
                n++;
                // fallback: si crece mucho, recorta base
                if (trimmedBase.length() > BASE_MAX - 10) {
                    candidate = base.length() > (BASE_MAX - 10) ? base.substring(0, BASE_MAX - 10) : base;
                }
            }
        }
        return candidate;
    }

    private boolean isTakenOrReserved(String s) {
        return RESERVED.contains(s) || usuarioRepository.existsBySlug(s);
    }
}
