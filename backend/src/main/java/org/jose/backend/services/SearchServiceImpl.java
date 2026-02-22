package org.jose.backend.services;

import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.jose.backend.model.Usuario;
import org.jose.backend.repository.SearchRepository;
import org.jose.backend.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class SearchServiceImpl implements SearchService {
    private final SearchRepository searchRepository;
    private final CurrentUserService currentUser;

    public SearchServiceImpl(SearchRepository searchRepository, CurrentUserService currentUser) {
        this.searchRepository = searchRepository;
        this.currentUser = currentUser;
    }

    @Override
    public Page<UserSummaryResponse> buscarUsuarios(String query, int page, int size) {
        if (query == null || query.trim().isEmpty()) {
            return Page.empty();
        }

        Usuario me = currentUser.getUser();
        return searchRepository.searchUsuarios(query, me.getId(), PageRequest.of(page, size)).map(this::mappingUserSummary);
    }

    //AmistadServiceImpl
    public UserSummaryResponse mappingUserSummary(Usuario u) {
        String photo = u.getProfilePicture() != null ? u.getProfilePicture().getImagenUrl() : null;
        return new UserSummaryResponse(
                u.getId(),
                u.getName(),
                u.getSurname(),
                u.getSlug(),
                photo
        );
    }
}
