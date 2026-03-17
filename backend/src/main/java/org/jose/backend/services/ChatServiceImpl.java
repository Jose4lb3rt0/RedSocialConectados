package org.jose.backend.services;

import org.jose.backend.dto.Chat.ConversacionResponse;
import org.jose.backend.dto.Chat.MensajeResponse;
import org.jose.backend.model.Conversacion;
import org.jose.backend.model.Imagen;
import org.jose.backend.model.Mensaje;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.ConversacionRepository;
import org.jose.backend.repository.MensajeRepository;
import org.jose.backend.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ConversacionRepository conversacionRepo;
    private final MensajeRepository mensajeRepo;
    private final UsuarioRepository usuarioRepo;
    private final CurrentUserService currentUserService;
    private final ImagenService imagenService;

    public ChatServiceImpl(ConversacionRepository conversacionRepo, MensajeRepository mensajeRepo, UsuarioRepository usuarioRepo, CurrentUserService currentUserService, ImagenService imagenService) {
        this.conversacionRepo = conversacionRepo;
        this.mensajeRepo = mensajeRepo;
        this.usuarioRepo = usuarioRepo;
        this.currentUserService = currentUserService;
        this.imagenService = imagenService;
    }

    private MensajeResponse toMensajeResponse(Mensaje m) {
        return new MensajeResponse(
            m.getId(),
            m.getConversacion().getId(),
            m.getAutor().getId(),
            m.getAutor().getName() + " " + m.getAutor().getSurname(),
            m.getAutor().getProfilePicture() != null ? m.getAutor().getProfilePicture().getImagenUrl() : null,
            m.getContenido(),
            m.getMediaUrl(),
            m.getTipoMensaje().name(),
            m.isLeido(),
            m.getCreadoEn()
        );
    }

    private ConversacionResponse toConversacionResponse(Conversacion c, Long userId) {
        Usuario otro = c.getOtroParticipante(userId);
        var ultimoOpt = mensajeRepo.findUltimoMensaje(c.getId());
        String ultimoContenido = null;
        String ultimoTipo = null;

        if (ultimoOpt.isPresent()) {
            Mensaje ultimo = ultimoOpt.get();
            ultimoContenido = ultimo.getTipoMensaje() == Mensaje.TipoMensaje.IMAGE ? "📸 Imagen" : ultimo.getContenido();
            ultimoTipo = ultimo.getTipoMensaje().name();
        }

        long noLeidos = mensajeRepo.countNoLeidos(c.getId(), userId);

        return new ConversacionResponse(
            c.getId(),
            otro.getId(),
            otro.getName() + " " + otro.getSurname(),
            otro.getSlug(),
            otro.getProfilePicture() != null ? otro.getProfilePicture().getImagenUrl() : null,
            ultimoContenido,
            ultimoTipo,
            c.getUltimoMensajeEn(),
            noLeidos,
            c.getCreadaEn()
        );
    }

    @Override
    public ConversacionResponse obtenerOCrearConversacion(Long otroUsuarioId) {
        Usuario me = currentUserService.getUser();

        if (me.getId().equals(otroUsuarioId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes chatear contigo mismo");
        }

        Usuario otro = usuarioRepo.findById(otroUsuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Conversacion conv = conversacionRepo.findByParticipantes(me.getId(), otroUsuarioId)
                .orElseGet(() -> {
                    Conversacion nueva = new Conversacion();
                    nueva.setParticipante1(me);
                    nueva.setParticipante2(otro);
                    return conversacionRepo.save(nueva);
                });

        return toConversacionResponse(conv, me.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConversacionResponse> listarConversaciones(Pageable pageable) {
        Usuario me = currentUserService.getUser();
        return conversacionRepo.findByUsuario(me.getId(), pageable)
                .map(c -> toConversacionResponse(c, me.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MensajeResponse> listarMensajes(Long conversacionId, Pageable pageable) {
        Usuario me = currentUserService.getUser();
        Conversacion conv = conversacionRepo.findById(conversacionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversación no encontrada"));

        if (!conv.getParticipante1().getId().equals(me.getId()) &&
                !conv.getParticipante2().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a esta conversación");
        }

        return mensajeRepo.findByConversacionIdOrderByCreadoEnDesc(conversacionId, pageable)
                .map(this::toMensajeResponse);
    }

    @Override
    public MensajeResponse enviarMensaje(Long conversacionId, String contenido) {
        Usuario me = currentUserService.getUser();
        Conversacion conv = conversacionRepo.findById(conversacionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversacion no encontrada"));

        if (!conv.getParticipante1().getId().equals(me.getId()) &&
            !conv.getParticipante2().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a esta conversación");
        }

        if (contenido == null || contenido.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El mensaje no puede estar vacío");
        }

        Mensaje m = new Mensaje();
        m.setConversacion(conv);
        m.setAutor(me);
        m.setContenido(contenido.trim());
        m.setTipoMensaje(Mensaje.TipoMensaje.TEXT);
        mensajeRepo.save(m);

        conv.setUltimoMensajeEn(Instant.now());
        conversacionRepo.save(conv);

        return toMensajeResponse(m);
    }

    @Override
    public MensajeResponse enviarMensajeConImagen(Long conversacionId, String contenido, MultipartFile file) throws IOException {
        Usuario me = currentUserService.getUser();
        Conversacion conv = conversacionRepo.findById(conversacionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversación no encontrada"));
        if (!conv.getParticipante1().getId().equals(me.getId()) &&
                !conv.getParticipante2().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a esta conversación");
        }

        Imagen img = imagenService.uploadImagen(file);

        Mensaje m = new Mensaje();
        m.setConversacion(conv);
        m.setAutor(me);
        m.setContenido(contenido != null && !contenido.isBlank() ? contenido.trim() : null);
        m.setImagen(img);
        m.setTipoMensaje(Mensaje.TipoMensaje.IMAGE);
        mensajeRepo.save(m);

        conv.setUltimoMensajeEn(Instant.now());
        conversacionRepo.save(conv);

        return toMensajeResponse(m);
    }

    @Override
    public void marcarComoLeidos(Long conversacionId) {
        Usuario me = currentUserService.getUser();
        mensajeRepo.marcarComoLeidos(conversacionId, me.getId());
    }
}
