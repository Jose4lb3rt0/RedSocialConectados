package org.jose.backend.controller;

import org.jose.backend.dto.Chat.MensajeResponse;
import org.jose.backend.model.Conversacion;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.ConversacionRepository;
import org.jose.backend.repository.MensajeRepository;
import org.jose.backend.repository.UsuarioRepository;
import org.jose.backend.services.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;

@Controller
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final ConversacionRepository conversacionRepo;
    //private final MensajeRepository mensajeRepo;
    private final UsuarioRepository usuarioRepo;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate, ChatService chatService, ConversacionRepository conversacionRepo, UsuarioRepository usuarioRepo) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.conversacionRepo = conversacionRepo;
        this.usuarioRepo = usuarioRepo;
    }

    // ---------- Payload de entrada ---------- //

    public static class TypingPayload {
        private Long conversacionId;
        private boolean escribiendo;
        public Long getConversacionId() { return conversacionId; }
        public void setConversacionId(Long conversacionId) { this.conversacionId = conversacionId; }
        public boolean isEscribiendo() { return escribiendo; }
        public void setEscribiendo(boolean escribiendo) { this.escribiendo = escribiendo; }
    }

    public static class LeidoPayload {
        private Long conversacionId;
        public Long getConversacionId() { return conversacionId; }
        public void setConversacionId(Long conversacionId) { this.conversacionId = conversacionId; }
    }

    // ---------- Payload de salida para typing ---------- //

    public static class TypingEvent {
        private Long conversacionId;
        private Long usuarioId;
        private boolean escribiendo;
        public TypingEvent(Long conversacionId, Long usuarioId, boolean escribiendo) {
            this.conversacionId = conversacionId;
            this.usuarioId = usuarioId;
            this.escribiendo = escribiendo;
        }
        public Long getConversacionId() { return conversacionId; }
        public Long getUsuarioId() { return usuarioId; }
        public boolean isEscribiendo() { return escribiendo; }
    }

    // ---------- Handlers STOMP ---------- //

    /**
     * Indicador de escritura
     * Cliente envía a /app/chat.typing y el servidor reenvía al otro participante como evento de typing
     */
    @Transactional
    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingPayload payload, Principal principal) {
        if (principal == null) return;

        Conversacion conv = conversacionRepo.findById(payload.getConversacionId()).orElse(null);
        if (conv == null) return;

        Usuario remitente = usuarioRepo.findByEmail(principal.getName()).orElse(null);
        if (remitente == null) return;

        Usuario destinatario = conv.getOtroParticipante(remitente.getId());

        messagingTemplate.convertAndSendToUser(
                destinatario.getEmail(),
                "/queue/typing",
                new TypingEvent(payload.getConversacionId(), remitente.getId(), payload.isEscribiendo())
        );
    }

    /**
     * Confirmación de lectura
     * Cliente envía a /app/chat.leido y el servidor marca como leídos y notifica al otro participante
     */
    @Transactional
    @MessageMapping("/chat.leido")
    public void leido(@Payload LeidoPayload payload, Principal principal) {
        if (principal == null) return;

        chatService.marcarComoLeidos(payload.getConversacionId());

        Conversacion conv = conversacionRepo.findById(payload.getConversacionId()).orElse(null);
        if (conv == null) return;

        Usuario lector = usuarioRepo.findByEmail(principal.getName()).orElse(null);
        if (lector == null) return;

        Usuario otro = conv.getOtroParticipante(lector.getId());

        messagingTemplate.convertAndSendToUser(
                otro.getEmail(),
                "/queue/leido",
                payload.getConversacionId()
        );
    }
}
