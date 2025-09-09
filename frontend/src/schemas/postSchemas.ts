import z from "zod"

export const postSchema = z.object({
    content: z.string().max(1000, { message: "El contenido no puede exceder los 1000 caracteres." }),
    media: z.file().optional(),
})

export type PostFormData = z.infer<typeof postSchema>