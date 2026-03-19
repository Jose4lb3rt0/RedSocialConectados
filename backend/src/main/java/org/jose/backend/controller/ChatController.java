package org.jose.backend.controller;


import org.jose.backend.dto.Chat.ConversacionResponse;
import org.jose.backend.dto.Chat.MensajeResponse;
import org.jose.backend.services.ChatService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("conversaciones/{otroUsuarioId}")
    public ResponseEntity<ConversacionResponse> obtenerOCrear(@PathVariable Long otroUsuarioId) {
        return ResponseEntity.ok(chatService.obtenerOCrearConversacion(otroUsuarioId));
    }

    @GetMapping("/conversaciones")
     public Page<ConversacionResponse> listarConversaciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return chatService.listarConversaciones(PageRequest.of(page, size));
     }

    @GetMapping("/conversaciones/{conversacionId}/mensajes")
    public Page<MensajeResponse> listarMensajes(
            @PathVariable Long conversacionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        return chatService.listarMensajes(conversacionId, PageRequest.of(page, size));
    }

    record EnviarMensajeRequest (String contenido) {}

    @PostMapping("/conversaciones/{conversacionId}/mensajes")
    public ResponseEntity<MensajeResponse> enviarMensaje(
            @PathVariable Long conversacionId,
            @RequestBody EnviarMensajeRequest request) {
        return ResponseEntity.ok(chatService.enviarMensaje(conversacionId, request.contenido));
    }

    @PostMapping(value = "/conversaciones/{conversacionId}/mensajes/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MensajeResponse> enviarMensajeConImagen(
            @PathVariable Long conversacionId,
            @RequestPart(value = "contenido", required = false) String contenido,
            @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(chatService.enviarMensajeConImagen(conversacionId, contenido, file));
    }

    // Marcar mensajes como leídos
    @PostMapping("/conversaciones/{conversacionId}/leidos")
    public ResponseEntity<Void> marcarComoLeidos(@PathVariable Long conversacionId) {
        chatService.marcarComoLeidos(conversacionId);
        return ResponseEntity.noContent().build();
    }
}
