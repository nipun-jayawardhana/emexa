const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function parseResponse(res) {
  // try parse JSON, fallback to text
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

export async function getJSON(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    const body = await parseResponse(res);
    if (!res.ok) {
      const err = new Error(body?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  } catch (e) {
    // mark network errors so callers can show a specific message
    if (e instanceof TypeError || e.message?.includes('NetworkError') || e.message?.includes('failed')) {
      e.isNetworkError = true;
    }
    throw e;
  }
}

export async function postJSON(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await parseResponse(res);
    if (!res.ok) {
      const err = new Error(data?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  } catch (e) {
    if (e instanceof TypeError || e.message?.includes('NetworkError') || e.message?.includes('failed')) {
      e.isNetworkError = true;
    }
    throw e;
  }
}
