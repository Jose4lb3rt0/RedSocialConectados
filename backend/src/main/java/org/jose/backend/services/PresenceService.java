package org.jose.backend.services;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Mantiene en memoria el conjunto de emails con sesión WebSocket activa.
 * ConcurrentHashMap garantiza thread-safety sin bloqueos explícitos.
 */
@Service
public class PresenceService {

    private final Set<String> conectados = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void conectar(String email) {
        conectados.add(email);
    }

    public void desconectar(String email) {
        conectados.remove(email);
    }

    public  boolean estaConectado(String email) {
        return conectados.contains(email);
    }

    public Set<String> getConectados() {
        return Collections.unmodifiableSet(conectados);
    }
}
