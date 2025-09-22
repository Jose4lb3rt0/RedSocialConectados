import { apiFetch } from "../api/apibase"
import type { EditProfileFormData, RegisterFormData } from "../schemas/userSchemas"

//Raw
type MediaPictureRaw = {
    id: number
    nombre?: string
    imagenUrl?: string
    imagenId?: string
} | null

type UserProfileRaw = {
    id: number
    email: string
    name: string
    surname: string
    gender: "male" | "female" | "other" | "prefer not to say"
    biography?: string | null
    profilePicture?: MediaPictureRaw
    bannerPicture?: MediaPictureRaw
    slug: string
    dayOfBirth: number
    monthOfBirth: number
    yearOfBirth: number
}

export type UserProfile = {
    id: number
    email: string
    name: string
    surname: string
    gender: "male" | "female" | "other" | "prefer not to say"
    biography?: string | null
    profilePicture?: { imagenUrl: string } | null
    bannerPicture?: { imagenUrl: string } | null
    slug: string
    dayOfBirth: number
    monthOfBirth: number
    yearOfBirth: number
}

export type UserSummary = {
    id: number
    authorName: string
    authorSurname: string
    authorSlug: string
    authorPhoto?: string | null
    fullName?: string
}

export type Page<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
}

function toBirthPayload(birthday: string) {
    const [year, month, day] = birthday.split("-").map(Number)
    return { dayOfBirth: day, monthOfBirth: month, yearOfBirth: year }
}

function normalizePicture(pic: MediaPictureRaw): { imagenUrl: string } | null {
    if (!pic) return null
    const url = pic.imagenUrl ?? (pic as any)?.imageUrl ?? null
    return url ? { imagenUrl: url } : null
}

function toUserProfile(raw: UserProfileRaw): UserProfile {
    return {
        id: raw.id,
        email: raw.email,
        name: raw.name,
        surname: raw.surname,
        gender: raw.gender,
        biography: raw.biography ?? null,
        profilePicture: normalizePicture(raw.profilePicture ?? null),
        bannerPicture: normalizePicture(raw.bannerPicture ?? null),
        slug: raw.slug,
        dayOfBirth: raw.dayOfBirth,
        monthOfBirth: raw.monthOfBirth,
        yearOfBirth: raw.yearOfBirth,
    }
}

export async function registrarUsuario(data: RegisterFormData) {
    const { confirmPassword, birthday, ...rest } = data
    const userData = { ...rest, ...toBirthPayload(birthday) }
    return apiFetch("/auth/registro", {
        method: "POST",
        body: JSON.stringify(userData),
    })
}

export async function iniciarSesion(payload: { email: string; password: string }) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    })
}

export async function verificarCuenta(token: string) {
    return apiFetch(`/auth/verify?token=${encodeURIComponent(token)}`, {
        method: "POST",
    })
}

export async function obtenerPerfil(): Promise<UserProfile> {
    const data = await apiFetch("/users/profile", { method: "GET" })
    return toUserProfile(data as UserProfileRaw)
}

export async function obtenerPerfilPorSlug(slug: string): Promise<UserProfile> {
    const data = await apiFetch(`/users/slug/${encodeURIComponent(slug)}`, { method: "GET" })
    return toUserProfile(data as UserProfileRaw)
}

export async function actualizarPerfil(data: EditProfileFormData) {
    const { birthday, ...rest } = data
    const payload = { ...rest, ...toBirthPayload(birthday) }
    return apiFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
    })
}

export async function listaUsuarios(): Promise<Page<UserSummary>> {
    return apiFetch("/users", { method: "GET" })
}