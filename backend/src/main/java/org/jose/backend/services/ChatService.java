package org.jose.backend.services;

import org.jose.backend.dto.Chat.ConversacionResponse;
import org.jose.backend.dto.Chat.MensajeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ChatService {
    ConversacionResponse obtenerOCrearConversacion (Long otroUsuarioId);
    Page<ConversacionResponse> listarConversaciones (Pageable pageable);
    Page<MensajeResponse> listarMensajes (Long conversacionId, Pageable pageable); //Historial paginado de mensajes
    MensajeResponse enviarMensaje(Long conversacionId, String contenido);
    MensajeResponse enviarMensajeConImagen(Long conversacionId, String contenido, MultipartFile file) throws IOException;
    void marcarComoLeidos(Long conversacionId);
}
