import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectCard from "./ProjectCard";
import type { Project } from "../../types/portfolio";

const baseProject: Project = {
  namespace: "infra/k8s cluster",
  statusLabel: "Running · 3 nodes",
  mediaPlaceholder: "[Diagrama]",
  title: "Cluster K8s",
  description: "Infraestructura propia",
  chips: ["Kubernetes", "Helm"],
  links: [
    { label: "Ver Repositorio", href: "https://github.com/x/y" },
    { label: "Demo", href: "https://example.com" },
  ],
};

describe("ProjectCard", () => {
  it("genera un id seguro a partir del namespace", () => {
    const { container } = render(<ProjectCard project={baseProject} />);
    expect(container.querySelector("#project-infra-k8s-cluster")).not.toBeNull();
  });

  it("separa las etiquetas de estado por '·'", () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("3 nodes")).toBeInTheDocument();
  });

  it("muestra el placeholder cuando no hay imagen", () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText("[Diagrama]")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("muestra la imagen con el titulo como alt", () => {
    render(<ProjectCard project={{ ...baseProject, image: "/logos/k8s.svg" }} />);
    expect(screen.getByRole("img", { name: "Cluster K8s" })).toHaveAttribute("src", "/logos/k8s.svg");
    expect(screen.queryByText("[Diagrama]")).toBeNull();
  });

  it("renderiza chips y enlaces externos seguros", () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("Helm")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Ver Repositorio/ });
    expect(link).toHaveAttribute("href", "https://github.com/x/y");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
