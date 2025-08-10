const BASE_URL = "http://localhost:8080/api"

let getToken = () => localStorage.getItem("jwt")

export function injectTokenGetter(fn: () => string | null) {
    getToken = fn
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = getToken()
    const isFormData = options.body instanceof FormData
    const headers: Record<string, string> = { ...(options.headers as any) }

    if (token) headers.Authorization = `Bearer ${token}`
    if (!isFormData && !headers["Content-Type"]) headers["Content-Type"] = "application/json"

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

    const contentType = response.headers.get("Content-Type") || ""
    const isJson = contentType.includes("application/json")
    const data = isJson ? await response.json().catch(() => ({})) : await response.text()

    if (!response.ok) {
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent("auth:unauthorized"))
        }

        const message = isJson ? (data?.message || data?.error || response.statusText) : (data || response.statusText)
        const error = new Error(message)
            ; (error as any).status = response.status
            ; (error as any).data = data
        throw error
    }

    return data
}