import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectProvider } from "../src/context/ProjectContext";
import { Dashboard } from "../src/pages/Dashboard";
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

const exemplo: IProject = {
    id: "p1",
    nome: "Projeto exemplo",
    descricao: "Descrição do exemplo",
    tarefas: []
};

function iniciar() {
    render(
        <MemoryRouter>
            <ProjectProvider>
                <Dashboard/>
            </ProjectProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", mocks.confirmar);
    mocks.confirmar.mockReturnValue(true);
    mocks.listar.mockResolvedValue([structuredClone(exemplo)]);
    mocks.criar.mockImplementation(async (p: IProject) => p);
    mocks.atualizar.mockImplementation(async (id: string, dados: Partial<IProject>) =>
        ({ ...structuredClone(exemplo), ...dados, id })
    );
    mocks.eliminar.mockResolvedValue(undefined);
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("Ramificações do dashboard", () => {
    it("apresenta estado vazio quando não há projetos", async () => {
        mocks.listar.mockResolvedValue([]);
        iniciar();
        expect(await screen.findByText(/Ainda não existem projetos/)).toBeTruthy();
    });

    it("apresenta erro quando a API não responde", async () => {
        mocks.listar.mockRejectedValue(new Error("Serviço desligado"));
        iniciar();
        expect(await screen.findByRole("alert")).toBeTruthy();
        expect(screen.getByRole("alert").textContent).toContain("Serviço desligado");
    });

    it("abre e cancela o formulário de novo projeto", async () => {
        iniciar();
        await screen.findByText("Projeto exemplo");
        fireEvent.click(screen.getByText("Novo projeto"));
        expect(screen.getByRole("dialog", { name: "Novo projeto" })).toBeTruthy();
        fireEvent.click(screen.getByText("Cancelar"));
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("cria projeto e mostra confirmação", async () => {
        iniciar();
        await screen.findByText("Projeto exemplo");
        fireEvent.click(screen.getByText("Novo projeto"));

        fireEvent.change(screen.getByLabelText("Nome do projeto"), {
            target: { value: "Projeto criado" }
        });
        fireEvent.change(screen.getByLabelText("Descrição"), {
            target: { value: "Descrição do projeto" }
        });
        fireEvent.click(screen.getByText("Guardar projeto"));

        expect(await screen.findByText("Projeto criado")).toBeTruthy();
        expect(screen.getByRole("status").textContent).toContain("sucesso");
    });

    it("edita um projeto e atualiza o cartão", async () => {
        iniciar();
        await screen.findByText("Projeto exemplo");
        fireEvent.click(screen.getByRole("button", { name: "Editar Projeto exemplo" }));

        fireEvent.change(screen.getByLabelText("Nome do projeto"), {
            target: { value: "Projeto modificado" }
        });
        fireEvent.click(screen.getByText("Guardar projeto"));

        expect(await screen.findByText("Projeto modificado")).toBeTruthy();
    });

    it("mantém projeto se a eliminação for cancelada", async () => {
        mocks.confirmar.mockReturnValue(false);
        iniciar();
        await screen.findByText("Projeto exemplo");
        fireEvent.click(screen.getByRole("button", { name: "Eliminar Projeto exemplo" }));
        expect(mocks.eliminar).not.toHaveBeenCalled();
        expect(screen.getByText("Projeto exemplo")).toBeTruthy();
    });

    it("elimina projeto quando confirmado", async () => {
        iniciar();
        await screen.findByText("Projeto exemplo");
        fireEvent.click(screen.getByRole("button", { name: "Eliminar Projeto exemplo" }));
        await waitFor(() => expect(mocks.eliminar).toHaveBeenCalledWith("p1"));
        expect(await screen.findByText(/Ainda não existem projetos/)).toBeTruthy();
    });

    it("apresenta falha quando a eliminação é recusada pela API", async () => {
        mocks.eliminar.mockRejectedValue(new Error("Não foi possível eliminar"));
        iniciar();
        await screen.findByText("Projeto exemplo");
        fireEvent.click(screen.getByRole("button", { name: "Eliminar Projeto exemplo" }));
        await waitFor(() =>
            expect(screen.getByRole("status").textContent)
                .toContain("Não foi possível eliminar")
        );
    });

    it("calcula progresso geral de zero quando não existem tarefas", async () => {
        iniciar();
        await screen.findByText("Projeto exemplo");
        expect(screen.getAllByText("0%").length).toBeGreaterThan(0);
    });
});