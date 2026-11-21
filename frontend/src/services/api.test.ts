import { afterEach, describe, expect, it, vi } from "vitest";
import { createContact, getCurrentVisitor, registerVisitor } from "./api";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mockFetch(response: Response) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("registerVisitor", () => {
  it("hace POST JSON a /api/visitors/register y devuelve la respuesta", async () => {
    const body = { session_token: "abc", first_seen_at: "2026-01-01T00:00:00Z" };
    const fetchMock = mockFetch(jsonResponse(body));

    const result = await registerVisitor({ browser_name: "Firefox", os_name: "Linux" });

    expect(result).toEqual(body);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/visitors/register");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(init?.body as string)).toEqual({
      browser_name: "Firefox",
      os_name: "Linux",
    });
  });

  it("lanza un error con el texto del servidor si la respuesta no es ok", async () => {
    mockFetch(new Response("boom", { status: 500 }));
    await expect(registerVisitor({})).rejects.toThrow("boom");
  });

  it("usa el codigo de estado si el servidor no manda mensaje", async () => {
    mockFetch(new Response("", { status: 503 }));
    await expect(registerVisitor({})).rejects.toThrow("Request failed with status 503");
  });
});

describe("getCurrentVisitor", () => {
  it("envia el token en la cabecera x-session-token", async () => {
    const body = { session_token: "tok", first_seen_at: "2026-01-01T00:00:00Z" };
    const fetchMock = mockFetch(jsonResponse(body));

    await expect(getCurrentVisitor("tok")).resolves.toEqual(body);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/visitors/current");
    expect(init?.headers).toMatchObject({ "x-session-token": "tok" });
  });

  it("propaga 404 como error", async () => {
    mockFetch(new Response("", { status: 404 }));
    await expect(getCurrentVisitor("tok")).rejects.toThrow("status 404");
  });
});

describe("createContact", () => {
  it("hace POST a /api/contact con el formulario", async () => {
    const payload = { name: "Ana", email: "ana@x.cl", subject: "Hola", message: "Mensaje" };
    const fetchMock = mockFetch(jsonResponse(payload));

    await expect(createContact(payload)).resolves.toEqual(payload);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual(payload);
  });
});
