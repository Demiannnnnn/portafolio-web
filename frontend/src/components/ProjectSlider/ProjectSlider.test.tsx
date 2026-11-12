import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ProjectSlider from "./ProjectSlider";
import type { Project } from "../../types/portfolio";

const sampleProjects: Project[] = [
  {
    namespace: "proj/1",
    category: "DevOps & Cloud",
    statusLabel: "Running · Node 1",
    mediaPlaceholder: "[P1]",
    title: "Project 1",
    description: "Description 1",
    chips: ["React"],
    links: [{ label: "Repo", href: "https://example.com/1" }],
  },
  {
    namespace: "proj/2",
    category: "DevOps & Cloud",
    statusLabel: "Running · Node 2",
    mediaPlaceholder: "[P2]",
    title: "Project 2",
    description: "Description 2",
    chips: ["Rust"],
    links: [{ label: "Repo", href: "https://example.com/2" }],
  },
  {
    namespace: "proj/3",
    category: "DevOps & Cloud",
    statusLabel: "Running · Node 3",
    mediaPlaceholder: "[P3]",
    title: "Project 3",
    description: "Description 3",
    chips: ["K8s"],
    links: [{ label: "Repo", href: "https://example.com/3" }],
  },
];

describe("ProjectSlider", () => {
  it("resetea el indice a 0 cuando cambia la lista de proyectos", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ProjectSlider projects={sampleProjects} />);

    const dot1 = screen.getByLabelText("Ir al proyecto 1");
    const dot2 = screen.getByLabelText("Ir al proyecto 2");

    expect(dot1).toHaveClass("active");
    expect(dot2).not.toHaveClass("active");

    await user.click(dot2);

    expect(dot1).not.toHaveClass("active");
    expect(dot2).toHaveClass("active");

    const newProjects: Project[] = [
      {
        ...sampleProjects[1],
        namespace: "proj/new-1",
        title: "Nuevo 1",
      },
      {
        ...sampleProjects[2],
        namespace: "proj/new-2",
        title: "Nuevo 2",
      },
    ];

    rerender(<ProjectSlider projects={newProjects} />);

    const newDot1 = screen.getByLabelText("Ir al proyecto 1");
    const newDot2 = screen.getByLabelText("Ir al proyecto 2");

    expect(newDot1).toHaveClass("active");
    expect(newDot2).not.toHaveClass("active");
  });

  it("mantiene el indice activo si el rerender usa la misma referencia de lista", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ProjectSlider projects={sampleProjects} />);

    const dot1 = screen.getByLabelText("Ir al proyecto 1");
    const dot2 = screen.getByLabelText("Ir al proyecto 2");

    await user.click(dot2);

    expect(dot1).not.toHaveClass("active");
    expect(dot2).toHaveClass("active");

    rerender(<ProjectSlider projects={sampleProjects} />);

    expect(screen.getByLabelText("Ir al proyecto 1")).not.toHaveClass("active");
    expect(screen.getByLabelText("Ir al proyecto 2")).toHaveClass("active");
  });
});
