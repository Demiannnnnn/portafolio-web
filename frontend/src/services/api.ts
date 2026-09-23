const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export type VisitorPayload = {
  browser_name?: string;
  browser_version?: string;
  os_name?: string;
  device_type?: string;
  isp_name?: string;
  country_code?: string;
  city_name?: string;
};

export type TemporaryVisitorResponse = {
  session_token: string;
  first_seen_at: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function registerVisitor(
  payload: VisitorPayload,
): Promise<TemporaryVisitorResponse> {
  return apiRequest<TemporaryVisitorResponse>("/visitors/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentVisitor(
  sessionToken: string,
): Promise<TemporaryVisitorResponse> {
  const response = await fetch(`${API_BASE_URL}/visitors/current`, {
    headers: {
      "x-session-token": sessionToken,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as TemporaryVisitorResponse;
}

export async function createContact(
  payload: ContactPayload,
): Promise<ContactPayload> {
  return apiRequest<ContactPayload>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
