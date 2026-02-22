package org.jose.backend.controller;

import org.apache.coyote.Response;
import org.jose.backend.dto.Friends.UserSummaryResponse;
import org.jose.backend.services.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserSummaryResponse>> buscarUsuarios(
        @RequestParam String query,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ){
        return ResponseEntity.ok(searchService.buscarUsuarios(query, page, size));
    }
}
