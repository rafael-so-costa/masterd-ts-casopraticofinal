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

const projeto: IProject = {
    id: "p1",
    nome: "Projeto demonstrativo",
    descricao: "Descrição do projeto",
    tarefas: [{
        id: "t1",
        titulo: "Preparar documentação",
        descricao: "Organizar os documentos",
        dataConclusao: "2026-12-10",
        status: "pendente"
    }]
};

function abrir(rota = "/projetos/p1") {
    return render(
        <MemoryRouter initialEntries={[rota]}>
            <ProjectProvider>
                <Routes>
                    <Route path="/" element={<div>Dashboard inicial</div>}/>
                    <Route path="/projetos/:id" element={<ProjectDetail/>}/>
                </Routes>
            </ProjectProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.confirmar.mockReturnValue(true);
    vi.stubGlobal("confirm", mocks.confirmar);
    mocks.listar.mockResolvedValue([structuredClone(projeto)]);
    mocks.atualizar.mockImplementation(async (id: string, dados: Partial<IProject>) =>
        ({ ...structuredClone(projeto), ...dados, id })
    );
    mocks.eliminar.mockResolvedValue(undefined);
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("Página de detalhes do projeto", () => {
    it("apresenta projeto e respetivas tarefas", async () => {
        abrir();
        expect(await screen.findByRole("heading", {
            name: "Projeto demonstrativo"
        })).toBeTruthy();
        expect(screen.getByText("Preparar documentação")).toBeTruthy();
        expect(screen.getByText("0% de progresso")).toBeTruthy();
    });

    it("mostra mensagem para projeto inexistente", async () => {
        abrir("/projetos/inexistente");
        expect(await screen.findByText("Projeto não encontrado")).toBeTruthy();
    });

    it("abre formulário para criar tarefa", async () => {
        abrir();
        await screen.findByText("Preparar documentação");
        fireEvent.click(screen.getByText("Nova tarefa"));
        expect(screen.getByRole("dialog", { name: "Nova tarefa" })).toBeTruthy();
    });

    it("cria uma tarefa através do formulário", async () => {
        abrir();
        await screen.findByText("Preparar documentação");
        fireEvent.click(screen.getByText("Nova tarefa"));

        fireEvent.change(screen.getByLabelText("Título"), {
            target: { value: "Nova atividade" }
        });
        fireEvent.change(screen.getByLabelText("Descrição"), {
            target: { value: "Atividade adicionada" }
        });
        fireEvent.change(screen.getByLabelText("Data prevista"), {
            target: { value: "2026-12-15" }
        });
        fireEvent.click(screen.getByText("Guardar tarefa"));

        await waitFor(() => expect(mocks.atualizar).toHaveBeenCalled());
        expect(await screen.findByText("Nova atividade")).toBeTruthy();
    });

    it("edita as informações do projeto", async () => {
        abrir();
        await screen.findByText("Preparar documentação");
        fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
        expect(screen.getByRole("dialog", { name: "Editar projeto" })).toBeTruthy();

        fireEvent.change(screen.getByLabelText("Nome do projeto"), {
            target: { value: "Projeto atualizado" }
        });
        fireEvent.click(screen.getByText("Guardar projeto"));

        await waitFor(() =>
            expect(screen.getByRole("heading", { name: "Projeto atualizado" })).toBeTruthy()
        );
    });

    it("conclui uma tarefa e atualiza progresso", async () => {
        abrir();
        await screen.findByText("Preparar documentação");
        fireEvent.click(screen.getByRole("button", { name: "Concluir" }));

        await waitFor(() => expect(screen.getByText("100% de progresso")).toBeTruthy());
        expect(document.querySelector(".pill.status-concluida")?.textContent).toBe("Concluída");
    });

    it("elimina tarefa mediante confirmação", async () => {
        abrir();
        await screen.findByText("Preparar documentação");
        fireEvent.click(screen.getByRole("button", {
            name: "Eliminar tarefa Preparar documentação"
        }));
        await waitFor(() =>
            expect(screen.getByText("Este projeto ainda não tem tarefas.")).toBeTruthy()
        );
    });

    it("elimina o projeto e regressa ao dashboard", async () => {
        abrir();
        await screen.findByText("Preparar documentação");
        fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
        expect(await screen.findByText("Dashboard inicial")).toBeTruthy();
        expect(mocks.eliminar).toHaveBeenCalledWith("p1");
    });

    it("não elimina se a confirmação for recusada", async () => {
        mocks.confirmar.mockReturnValue(false);
        abrir();
        await screen.findByText("Preparar documentação");
        fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
        expect(mocks.eliminar).not.toHaveBeenCalled();
    });
});