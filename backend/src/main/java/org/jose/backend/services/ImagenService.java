package org.jose.backend.services;

import org.jose.backend.model.Imagen;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ImagenService {
    Imagen uploadImagen(MultipartFile file) throws IOException;
    void deleteImagen(Imagen imagen) throws IOException;
}
