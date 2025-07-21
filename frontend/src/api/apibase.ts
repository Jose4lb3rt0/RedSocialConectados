const BASE_URL = "http://localhost:8080/api"

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = ""
    const isFormData = options.body instanceof FormData

    const headers: Record<string, string> = {
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers as Record<string, string>),
    }

    if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json"
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    })

    const contentType = response.headers.get("Content-Type") || ""
    let data

    if (contentType.includes("application/json")) {
        data = await response.json()
    } else if (contentType.includes("text/plain")) {
        data = await response.text()
    } else if (
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream")
    ) {
        data = await response.blob()
    } else if (
        contentType.includes("image/") ||
        contentType.includes("application/vnd") ||
        contentType.includes("text/csv")
    ) {
        data = await response.blob()
    } else {
        data = await response.text()
    }

    if (!response.ok) {
        let errorMessage = `Error ${response.status}`
        if (typeof data === "string") {
            errorMessage = data
        } else if (data && typeof data === "object" && "message" in data) {
            errorMessage = (data as any).message
        }
        throw { status: response.status, message: errorMessage }
    }

    return data
}