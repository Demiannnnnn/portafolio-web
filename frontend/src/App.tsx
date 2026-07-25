import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import "./App.css";
import {
    createContact,
    getCurrentVisitor,
    registerVisitor,
    type ContactPayload,
    type TemporaryVisitorResponse,
    type VisitorPayload,
} from "./services/api";

const SESSION_STORAGE_KEY = "portfolio.visitor.session_token";

const endpointCards = [
  {
    method: "GET",
    path: "/api/ping",
    description: "Comprobación rápida de que el backend está vivo.",
  },
  {
    method: "POST",
    path: "/api/visitors/register",
    description: "Registra o refresca el visitante anónimo de la sesión.",
  },
  {
    method: "GET",
    path: "/api/visitors/current",
    description: "Recupera el visitante actual usando el session token.",
  },
  {
    method: "POST",
    path: "/api/contact",
    description: "Envía el formulario de contacto.",
  },
];

function detectVisitorMetadata(): VisitorPayload {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform || undefined;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);

  const browserMatch = userAgent.match(
    /(Firefox|Chrome|Edg|OPR|Safari)\/([\d.]+)/,
  );
  const browserName = browserMatch?.[1] ?? "Unknown";
  const browserVersion = browserMatch?.[2];

  let osName: string | undefined;
  if (/Windows/i.test(userAgent)) {
    osName = "Windows";
  } else if (/Macintosh|Mac OS/i.test(userAgent)) {
    osName = "macOS";
  } else if (/Android/i.test(userAgent)) {
    osName = "Android";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    osName = "iOS";
  } else if (/Linux/i.test(userAgent)) {
    osName = "Linux";
  }

  return {
    browser_name: browserName,
    browser_version: browserVersion,
    os_name: osName ?? platform,
    device_type: isMobile ? "mobile" : "desktop",
  };
}

function App() {
  const [visitor, setVisitor] = useState<TemporaryVisitorResponse | null>(null);
  const [visitorMessage, setVisitorMessage] = useState(
    "Preparando sesión de visitante...",
  );
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [visitorLoading, setVisitorLoading] = useState(true);
  const [trackingVisitor, setTrackingVisitor] = useState(false);

  const [contactForm, setContactForm] = useState<ContactPayload>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSending, setContactSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrapVisitor = async () => {
      try {
        setVisitorLoading(true);
        setVisitorError(null);

        const storedToken = window.localStorage.getItem(SESSION_STORAGE_KEY);

        if (storedToken) {
          try {
            const current = await getCurrentVisitor(storedToken);

            if (!cancelled) {
              setVisitor(current);
              setVisitorMessage(
                "Visitante recuperado desde almacenamiento local.",
              );
              return;
            }
          } catch {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }

        const registered = await registerVisitor(detectVisitorMetadata());

        if (!cancelled) {
          window.localStorage.setItem(
            SESSION_STORAGE_KEY,
            registered.session_token,
          );
          setVisitor(registered);
          setVisitorMessage("Visitante registrado correctamente.");
        }
      } catch (error) {
        if (!cancelled) {
          setVisitorError(
            error instanceof Error
              ? error.message
              : "No se pudo registrar el visitante.",
          );
          setVisitorMessage("No se pudo completar el tracking del visitante.");
        }
      } finally {
        if (!cancelled) {
          setVisitorLoading(false);
        }
      }
    };

    void bootstrapVisitor();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetryVisitor = async () => {
    try {
      setTrackingVisitor(true);
      setVisitorError(null);

      const registered = await registerVisitor(detectVisitorMetadata());
      window.localStorage.setItem(
        SESSION_STORAGE_KEY,
        registered.session_token,
      );
      setVisitor(registered);
      setVisitorMessage("Visitante sincronizado otra vez.");
    } catch (error) {
      setVisitorError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el visitante.",
      );
    } finally {
      setTrackingVisitor(false);
    }
  };

  const handleContactChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setContactForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactSending(true);
    setContactError(null);
    setContactStatus(null);

    try {
      await createContact(contactForm);
      setContactStatus("Tu mensaje fue enviado correctamente.");
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setContactError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el mensaje.",
      );
    } finally {
      setContactSending(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Portfolio interactivo</p>
          <h1>Un sitio sin login, pero con memoria de sesión.</h1>
          <p className="lead">
            Este frontend consume los endpoints de visitors y contact para
            registrar visitantes anónimos y enviar mensajes desde el formulario
            del portafolio.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleRetryVisitor}
            >
              {trackingVisitor ? "Sincronizando..." : "Registrar visitante"}
            </button>
            <span className="status-chip">
              Backend base: <strong>/api</strong>
            </span>
          </div>
        </div>

        <div className="hero-metrics">
          <article className="metric-card">
            <span className="metric-label">Estado</span>
            <strong>
              {visitorLoading ? "Cargando" : visitorError ? "Error" : "Activo"}
            </strong>
            <p>{visitorMessage}</p>
          </article>

          <article className="metric-card accent">
            <span className="metric-label">Session token</span>
            <strong>{visitor?.session_token ?? "Sin token"}</strong>
            <p>{visitor?.first_seen_at ?? "Aún no hay visitante registrado"}</p>
          </article>
        </div>
      </section>

      <section className="grid-layout">
        <section className="panel visitor-panel">
          <div className="section-heading">
            <p className="eyebrow">Visitors</p>
            <h2>Registro anónimo de visitante</h2>
          </div>

          <div className="visitor-details">
            <div>
              <span className="detail-label">Session token</span>
              <p>{visitor?.session_token ?? "No registrado todavía"}</p>
            </div>
            <div>
              <span className="detail-label">First seen</span>
              <p>{visitor?.first_seen_at ?? "Sin fecha disponible"}</p>
            </div>
          </div>

          <div className="endpoint-list">
            {endpointCards.map((endpoint) => (
              <article className="endpoint-card" key={endpoint.path}>
                <span className="endpoint-method">{endpoint.method}</span>
                <code>{endpoint.path}</code>
                <p>{endpoint.description}</p>
              </article>
            ))}
          </div>

          {visitorError ? <p className="error-box">{visitorError}</p> : null}
        </section>

        <section className="panel contact-panel">
          <div className="section-heading">
            <p className="eyebrow">Contact</p>
            <h2>Formulario de contacto</h2>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <label>
              Nombre
              <input
                name="name"
                value={contactForm.name}
                onChange={handleContactChange}
                placeholder="Tu nombre"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactChange}
                placeholder="tu@email.com"
                required
              />
            </label>

            <label>
              Asunto
              <input
                name="subject"
                value={contactForm.subject}
                onChange={handleContactChange}
                placeholder="Motivo de tu mensaje"
                required
              />
            </label>

            <label>
              Mensaje
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                placeholder="Cuéntame en qué te puedo ayudar"
                rows={6}
                required
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={contactSending}
            >
              {contactSending ? "Enviando..." : "Enviar mensaje"}
            </button>

            {contactStatus ? (
              <p className="success-box">{contactStatus}</p>
            ) : null}
            {contactError ? <p className="error-box">{contactError}</p> : null}
          </form>
        </section>
      </section>
    </main>
  );
}

export default App;
