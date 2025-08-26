package org.jose.backend.services;

import com.cloudinary.Cloudinary;
import org.jose.backend.model.Imagen;
import org.jose.backend.repository.ImagenRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class ImagenServiceImpl implements ImagenService {
    private final CloudinaryService cloudinaryService;
    private final ImagenRepository imagenRepository;

    public ImagenServiceImpl(CloudinaryService cloudinaryService, ImagenRepository imagenRepository) {
        this.cloudinaryService = cloudinaryService;
        this.imagenRepository = imagenRepository;
    }

    @Override
    public Imagen uploadImagen(MultipartFile file) throws IOException {
        Map uploadResult = cloudinaryService.upload(file);
        String imagenUrl = (String) uploadResult.get("url");
        String imagenId = (String) uploadResult.get("public_id");
        Imagen imagen = new Imagen(file.getOriginalFilename(), imagenUrl, imagenId);
        return imagenRepository.save(imagen);
    }

    @Override
    public void deleteImagen(Imagen imagen) throws IOException {
        cloudinaryService.delete(imagen.getImagenId());
        imagenRepository.delete(imagen);
    }
}
