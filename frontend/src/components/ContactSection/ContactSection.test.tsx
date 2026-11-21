import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactSection from "./ContactSection";
import { createContact } from "../../services/api";

vi.mock("../../services/api", () => ({
  createContact: vi.fn(),
}));

const createContactMock = vi.mocked(createContact);

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nombre"), "Ana");
  await user.type(screen.getByLabelText("Correo Electrónico"), "ana@example.com");
  await user.type(screen.getByLabelText("Asunto"), "Proyecto");
  await user.type(screen.getByLabelText("Mensaje"), "Hola!");
  return user;
}

describe("ContactSection", () => {
  beforeEach(() => {
    createContactMock.mockReset();
  });

  it("envia el formulario y muestra el estado de exito", async () => {
    createContactMock.mockResolvedValue({
      name: "Ana",
      email: "ana@example.com",
      subject: "Proyecto",
      message: "Hola!",
    });
    render(<ContactSection />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Enviar Mensaje" }));

    expect(createContactMock).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      subject: "Proyecto",
      message: "Hola!",
    });
    expect(await screen.findByText("¡Mensaje enviado con éxito!")).toBeInTheDocument();
  });

  it("vuelve a un formulario vacio tras 'Enviar otro mensaje'", async () => {
    createContactMock.mockResolvedValue({ name: "", email: "", subject: "", message: "" });
    render(<ContactSection />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Enviar Mensaje" }));
    await user.click(await screen.findByRole("button", { name: "Enviar otro mensaje" }));

    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(screen.getByLabelText("Mensaje")).toHaveValue("");
  });

  it("muestra el mensaje de error y conserva lo escrito", async () => {
    createContactMock.mockRejectedValue(new Error("Servidor caido"));
    render(<ContactSection />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Enviar Mensaje" }));

    expect(await screen.findByText(/Servidor caido/)).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByRole("button", { name: "Enviar Mensaje" })).toBeEnabled();
  });

  it("no envia si faltan campos obligatorios", async () => {
    render(<ContactSection />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Enviar Mensaje" }));
    expect(createContactMock).not.toHaveBeenCalled();
  });
});
