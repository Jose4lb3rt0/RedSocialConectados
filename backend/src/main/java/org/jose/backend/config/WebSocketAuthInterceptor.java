package org.jose.backend.config;

import org.jose.backend.repository.SolicitudAmistadRepository;
import org.jose.backend.repository.UsuarioRepository;
import org.jose.backend.security.JwtTokenUtil;
import org.jose.backend.services.PresenceService;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenUtil jwtTokenUtil;
    private final UsuarioRepository usuarioRepository;
    private final PresenceService presenceService;
    private final SolicitudAmistadRepository solicitudAmistadRepository;
    private SimpMessagingTemplate messagingTemplate;

    public WebSocketAuthInterceptor(JwtTokenUtil jwtTokenUtil, UsuarioRepository usuarioRepository, PresenceService presenceService, SolicitudAmistadRepository solicitudAmistadRepository) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.usuarioRepository = usuarioRepository;
        this.presenceService = presenceService;
        this.solicitudAmistadRepository = solicitudAmistadRepository;
    }

    // Setter injection para evitar dependencia circular
    public void setMessagingTemplate(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Solo autenticamos en el momento de la conexión STOMP al inicio
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                if (jwtTokenUtil.validarToken(token)) {
                    String email = jwtTokenUtil.extraerUsuarioDelToken(token);

                    usuarioRepository.findByEmail(email).ifPresent(usuario -> {
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                Collections.emptyList()
                        );
                        // Asociar el principal al accessor para que Spring pueda identificar al usuario
                        accessor.setUser(auth);
                        presenceService.conectar(email);
                        notificarAmigos(usuario.getId(), email, true);
                    });
                }
            }
        }

        if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            if (accessor.getUser() != null) {
                String email = accessor.getUser().getName();
                presenceService.desconectar(email);
                usuarioRepository.findByEmail(email).ifPresent(usuario -> {
                    notificarAmigos(usuario.getId(), email, false);
                });
            }
        }

        return message;
    }

    /* Publica en WS */
    private void notificarAmigos(Long usuarioId, String email, boolean conectado) {
        if (messagingTemplate == null) return;

        solicitudAmistadRepository
                .findAmigos(usuarioId, org.springframework.data.domain.Pageable.unpaged())
                .forEach(solicitud -> {
                    String amigoEmail = solicitud.getSolicitante().getId().equals(usuarioId)
                            ? solicitud.getDestinatario().getEmail()
                            : solicitud.getSolicitante().getEmail();

                    messagingTemplate.convertAndSendToUser(
                            amigoEmail,
                            "/queue/presence",
                            new PresenceEvent(email, conectado)
                    );
                });
    }

    public record PresenceEvent(String email, boolean conectado) {}
}
