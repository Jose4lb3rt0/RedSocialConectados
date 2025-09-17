package org.jose.backend.dto.Post;

import lombok.Data;
import org.jose.backend.model.Reaccion;

@Data
public class SetReaccionRequest {
    private Reaccion type;

    public Reaccion getType() {
        return type;
    }

    public void setType(Reaccion type) {
        this.type = type;
    }
}
