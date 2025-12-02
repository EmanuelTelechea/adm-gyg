export async function fetchJson(url: string, options?: RequestInit) {
	const res = await fetch(url, options);
	const text = await res.text();
	if (!res.ok) {
		// Throw a clear error with the server response (HTML/text or JSON)
		throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
	}
	try {
		return JSON.parse(text);
	} catch {
		// If server returned non-JSON on a 2xx, surface the body to help debugging
		throw new Error(`Respuesta no JSON del servidor: ${text}`);
	}
}

// Nuevo helper: no lanza, devuelve info util sobre la respuesta
export async function fetchJsonSafe(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any | null; text: string }> {
	const res = await fetch(url, options);
	const text = await res.text().catch(() => "");
	let data = null;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		data = null;
	}
	return { ok: res.ok, status: res.status, data, text };
}