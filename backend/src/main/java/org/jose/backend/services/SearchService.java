package org.jose.backend.services;

import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.springframework.data.domain.Page;

public interface SearchService {
    Page<UserSummaryResponse> buscarUsuarios(String query, int page, int size);
}
