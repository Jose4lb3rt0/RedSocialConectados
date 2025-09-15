package org.jose.backend.services;

import org.jose.backend.model.Usuario;

public interface CurrentUserService {
    String getEmail();
    Usuario getUser();
}