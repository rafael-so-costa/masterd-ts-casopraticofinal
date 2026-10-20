import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProjectProvider } from "../src/context/ProjectContext";
import { ProjectDetail } from "../src/pages/ProjectDetail";
import type { IProject } from "../src/types/project";

const mocks = vi.hoisted(() => ({
    listar: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    eliminar: vi.fn(),
    confirmar: vi.fn()
}));

vi.mock("../src/services/projectService", () => ({
    projectService: {
        listar: mocks.listar,
        criar: mocks.criar,
        atualizar: mocks.atualizar,
        eliminar: mocks.eliminar
    }
}));

const inicial: IProject = {
    id: "p1",
    nome: "Projeto de teste",
    descricao: "Descrição do projeto",
    tarefas: [{
        id: "t1",
        titulo: "Tarefa de teste",
        descricao: "Descrição da tarefa",
        dataConclusao: "2026-12-10",
        status: "pendente"
    }]
};

function abrir() {
    render(
        <MemoryRouter initialEntries={["/projetos/p1"]}>
            <ProjectProvider>
                <Routes>
                    <Route path="/" element={<div>Dashboard</div>}/>
                    <Route path="/projetos/:id" element={<ProjectDetail/>}/>
                </Routes>
            </ProjectProvider>
        </MemoryRouter>
    );
}

async function carregado() {
    await screen.findByRole("heading", { name: "Projeto de teste" });
    await screen.findByText("Tarefa de teste");
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.confirmar.mockReturnValue(true);
    vi.stubGlobal("confirm", mocks.confirmar);
    mocks.listar.mockResolvedValue(structuredClone([inicial]));
    mocks.criar.mockImplementation(async (p: IProject) => p);
    mocks.atualizar.mockImplementation(
        async (id: string, dados: Partial<IProject>) => ({
            ...structuredClone(inicial),
            ...dados,
            id
        })
    );
    mocks.eliminar.mockResolvedValue(undefined);
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("Ramificações adicionais de ProjectDetail", () => {
    it("cancela a edição do projeto", async () => {
        abrir();
        await carregado();

        fireEvent.click(
            screen.getAllByRole("button", { name: "Editar" })[0]
        );

        expect(screen.getByRole("dialog", {
            name: "Editar projeto"
        })).toBeTruthy();

        fireEvent.click(screen.getByText("Cancelar"));

        expect(screen.queryByRole("dialog")).toBeNull();
        expect(mocks.atualizar).not.toHaveBeenCalled();
    });

    it("cancela a criação de uma tarefa", async () => {
        abrir();
        await carregado();

        fireEvent.click(screen.getByText("Nova tarefa"));

        expect(screen.getByRole("dialog", {
            name: "Nova tarefa"
        })).toBeTruthy();

        fireEvent.click(screen.getByText("Cancelar"));

        expect(screen.queryByRole("dialog")).toBeNull();
        expect(mocks.atualizar).not.toHaveBeenCalled();
    });

    it("abre e cancela a edição de tarefa existente", async () => {
        abrir();
        await carregado();

        fireEvent.click(
            screen.getAllByRole("button", { name: "Editar" })[1]
        );

        expect(screen.getByRole("dialog", {
            name: "Editar tarefa"
        })).toBeTruthy();

        expect(
            (screen.getByLabelText("Título") as HTMLInputElement).value
        ).toBe("Tarefa de teste");

        fireEvent.click(screen.getByText("Cancelar"));

        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("edita uma tarefa através do formulário", async () => {
        abrir();
        await carregado();

        fireEvent.click(
            screen.getAllByRole("button", { name: "Editar" })[1]
        );

        fireEvent.change(screen.getByLabelText("Título"), {
            target: { value: "Tarefa modificada" }
        });

        fireEvent.click(screen.getByText("Guardar tarefa"));

        expect(
            await screen.findByText("Tarefa modificada")
        ).toBeTruthy();

        expect(mocks.atualizar).toHaveBeenCalledWith(
            "p1",
            expect.objectContaining({
                tarefas: expect.arrayContaining([
                    expect.objectContaining({
                        id: "t1",
                        titulo: "Tarefa modificada"
                    })
                ])
            })
        );
    });

    it("não elimina tarefa quando o utilizador cancela", async () => {
        mocks.confirmar.mockReturnValue(false);
        abrir();
        await carregado();

        fireEvent.click(screen.getByRole("button", {
            name: "Eliminar tarefa Tarefa de teste"
        }));

        expect(mocks.confirmar).toHaveBeenCalled();
        expect(mocks.atualizar).not.toHaveBeenCalled();
        expect(screen.getByText("Tarefa de teste")).toBeTruthy();
    });

    it("atualiza o estado através do seletor", async () => {
        abrir();
        await carregado();

        fireEvent.change(screen.getByRole("combobox", {
            name: "Estado de Tarefa de teste"
        }), {
            target: { value: "em_progresso" }
        });

        await waitFor(() => {
            expect(document.querySelector(
                ".pill.status-em_progresso"
            )?.textContent).toBe("Em progresso");
        });

        expect(mocks.atualizar).toHaveBeenCalled();
    });

    it("mostra erro quando a mudança de estado falha", async () => {
        mocks.atualizar.mockRejectedValue(
            new Error("Falha ao alterar o estado")
        );

        abrir();
        await carregado();

        fireEvent.change(screen.getByRole("combobox", {
            name: "Estado de Tarefa de teste"
        }), {
            target: { value: "em_progresso" }
        });

        await waitFor(() => {
            expect(screen.getByRole("status").textContent)
                .toContain("Falha ao alterar o estado");
        });

        expect(screen.getByText("Tarefa de teste")).toBeTruthy();
    });

    it("mostra erro quando a eliminação de tarefa falha", async () => {
        mocks.atualizar.mockRejectedValue(
            new Error("Tarefa não eliminada")
        );

        abrir();
        await carregado();

        fireEvent.click(screen.getByRole("button", {
            name: "Eliminar tarefa Tarefa de teste"
        }));

        await waitFor(() => {
            expect(screen.getByRole("status").textContent)
                .toContain("Tarefa não eliminada");
        });
    });

    it("mostra erro quando a eliminação do projeto falha", async () => {
        mocks.eliminar.mockRejectedValue(
            new Error("Projeto não eliminado")
        );

        abrir();
        await carregado();

        fireEvent.click(screen.getByRole("button", {
            name: "Eliminar"
        }));

        await waitFor(() => {
            expect(screen.getByRole("status").textContent)
                .toContain("Projeto não eliminado");
        });

        expect(screen.getByRole("heading", {
            name: "Projeto de teste"
        })).toBeTruthy();
    });

    it("mantém o formulário aberto quando a edição falha", async () => {
        mocks.atualizar.mockRejectedValue(
            new Error("Não foi possível guardar")
        );

        abrir();
        await carregado();

        fireEvent.click(
            screen.getAllByRole("button", { name: "Editar" })[0]
        );

        fireEvent.click(screen.getByText("Guardar projeto"));

        await waitFor(() => {
            expect(screen.getAllByRole("alert").some(
                elemento => elemento.textContent?.includes("Não foi possível guardar")
            )).toBe(true);
        });

        expect(screen.getByRole("dialog", {
            name: "Editar projeto"
        })).toBeTruthy();
    });
});