const BASE_URL = "http://localhost:8080/api"

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = ""
    const isFormData = options.body instanceof FormData

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    }
    if (token) headers.Authorization = `Bearer ${token}`
    if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json"
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

    const contentType = response.headers.get("Content-Type") || ""
    const isJson = contentType.includes("application/json")
    let data: any
    try {
        data = isJson ? await response.json() : await response.text()
    } catch {
        data = null
    }

    if (!response.ok) {
        const msgFromJson = typeof data === "object" ? (data?.message || data?.error || data?.errors?.[0] || "") : ""
        const msgFromText = typeof data === "string" ? data : ""
        const message =
            (msgFromJson && String(msgFromJson)) ||
            (msgFromText && msgFromText.trim()) ||
            response.statusText ||
            "Ocurrió un error"

        const error = new Error(message)
            ; (error as any).status = response.status
            ; (error as any).data = data
        throw error
    }

    return data
}