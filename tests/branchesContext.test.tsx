import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProjectProvider } from "../src/context/ProjectContext";
import { useProjects } from "../src/hooks/useProjects";
import type { IProject, TaskInput } from "../src/types/project";

const mocks = vi.hoisted(() => ({
    listar: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    eliminar: vi.fn()
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
    nome: "Projeto inicial",
    descricao: "Descrição inicial",
    tarefas: [{
        id: "t1",
        titulo: "Tarefa inicial",
        descricao: "Descrição inicial",
        dataConclusao: "2026-12-10",
        status: "pendente"
    }]
};

const tarefa: TaskInput = {
    titulo: "Tarefa válida",
    descricao: "Descrição válida",
    dataConclusao: "2026-12-15",
    status: "em_progresso"
};

function Painel() {
    const ctx = useProjects();

    async function executar(fn: () => Promise<void>) {
        try {
            await fn();
        } catch {
        }
    }

    return (
        <div>
            <span data-testid="loading">{String(ctx.carregando)}</span>
            <span data-testid="ocupado">{String(ctx.ocupado)}</span>
            <span data-testid="quantidade">{ctx.projetos.length}</span>
            {ctx.erro && <p role="alert">{ctx.erro}</p>}

            <button onClick={() => void ctx.atualizar()}>Recarregar</button>

            <button onClick={() => void executar(() =>
                ctx.criarProjeto({ nome: "", descricao: "" })
            )}>Projeto inválido</button>

            <button onClick={() => void executar(() =>
                ctx.criarProjeto({ nome: "Novo", descricao: "Descrição" })
            )}>Criar válido</button>

            <button onClick={() => void executar(() =>
                ctx.editarProjeto("p1", { nome: "", descricao: "" })
            )}>Editar inválido</button>

            <button onClick={() => void executar(() =>
                ctx.editarProjeto("p1", { nome: "Editado", descricao: "Descrição" })
            )}>Editar válido</button>

            <button onClick={() => void executar(() =>
                ctx.excluirProjeto("p1")
            )}>Excluir projeto</button>

            <button onClick={() => void executar(() =>
                ctx.criarTarefa("p1", { ...tarefa, titulo: "" })
            )}>Tarefa inválida</button>

            <button onClick={() => void executar(() =>
                ctx.criarTarefa("p1", tarefa)
            )}>Criar tarefa válida</button>

            <button onClick={() => void executar(() =>
                ctx.criarTarefa("inexistente", tarefa)
            )}>Criar sem projeto</button>

            <button onClick={() => void executar(() =>
                ctx.editarTarefa("p1", "t1", { ...tarefa, dataConclusao: "erro" })
            )}>Editar tarefa inválida</button>

            <button onClick={() => void executar(() =>
                ctx.editarTarefa("p1", "inexistente", tarefa)
            )}>Editar tarefa inexistente</button>

            <button onClick={() => void executar(() =>
                ctx.excluirTarefa("p1", "t1")
            )}>Excluir tarefa</button>

            <button onClick={() => void executar(() =>
                ctx.mudarEstado("p1", "inexistente", "concluida")
            )}>Estado sem tarefa</button>
        </div>
    );
}

function iniciar() {
    render(<ProjectProvider><Painel/></ProjectProvider>);
}

async function pronto() {
    await waitFor(() =>
        expect(screen.getByTestId("loading").textContent).toBe("false")
    );
}

async function alerta(mensagem: string) {
    await waitFor(() =>
        expect(screen.getByRole("alert").textContent).toContain(mensagem)
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.listar.mockResolvedValue([structuredClone(projeto)]);
    mocks.criar.mockImplementation(async (p: IProject) => p);
    mocks.atualizar.mockImplementation(async (id: string, dados: Partial<IProject>) =>
        ({ ...structuredClone(projeto), ...dados, id })
    );
    mocks.eliminar.mockResolvedValue(undefined);
});

afterEach(cleanup);

describe("Cobertura de ramificações do Context API", () => {
    it("começa em carregamento e termina", async () => {
        iniciar();
        expect(screen.getByTestId("loading").textContent).toBe("true");
        await pronto();
        expect(screen.getByTestId("quantidade").textContent).toBe("1");
    });

    it("trata falha de rede durante a listagem", async () => {
        mocks.listar.mockRejectedValue(new Error("Rede indisponível"));
        iniciar();
        await alerta("Rede indisponível");
        expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    it("limpa erro ao recarregar com sucesso", async () => {
        mocks.listar.mockRejectedValueOnce(new Error("Falha temporária"));
        iniciar();
        await alerta("Falha temporária");
        fireEvent.click(screen.getByText("Recarregar"));
        await pronto();
        await waitFor(() =>
            expect(screen.queryByRole("alert")).toBeNull()
        );
    });

    it("impede criação de projeto inválido", async () => {
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Projeto inválido"));
        await alerta("nome");
        expect(mocks.criar).not.toHaveBeenCalled();
    });

    it("regista falha na criação de projeto", async () => {
        mocks.criar.mockRejectedValue(new Error("Criação recusada"));
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Criar válido"));
        await alerta("Criação recusada");
        expect(screen.getByTestId("quantidade").textContent).toBe("1");
    });

    it("rejeita atualização de projeto inválida", async () => {
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Editar inválido"));
        await alerta("nome");
        expect(mocks.atualizar).not.toHaveBeenCalled();
    });

    it("trata erro na atualização de projeto", async () => {
        mocks.atualizar.mockRejectedValue(new Error("Atualização recusada"));
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Editar válido"));
        await alerta("Atualização recusada");
    });

    it("trata erro na eliminação do projeto", async () => {
        mocks.eliminar.mockRejectedValue(new Error("Eliminação recusada"));
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Excluir projeto"));
        await alerta("Eliminação recusada");
    });

    it("rejeita criação de tarefa inválida", async () => {
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Tarefa inválida"));
        expect(mocks.atualizar).not.toHaveBeenCalled();
    });

    it("trata projeto inexistente ao criar tarefa", async () => {
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Criar sem projeto"));
        await alerta("Projeto não encontrado");
    });

    it("rejeita edição de tarefa com data inválida", async () => {
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Editar tarefa inválida"));
        expect(mocks.atualizar).not.toHaveBeenCalled();
    });

    it("trata edição de tarefa inexistente", async () => {
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Editar tarefa inexistente"));
        await alerta("Tarefa não encontrada");
    });

    it("trata erro da API na criação de tarefa", async () => {
        mocks.atualizar.mockRejectedValue(new Error("Erro ao guardar tarefa"));
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Criar tarefa válida"));
        await alerta("Erro ao guardar tarefa");
    });

    it("trata erro na eliminação de tarefa", async () => {
        mocks.atualizar.mockRejectedValue(new Error("Erro ao eliminar tarefa"));
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Excluir tarefa"));
        await alerta("Erro ao eliminar tarefa");
    });

    it("trata mudança de estado de tarefa inexistente", async () => {
        iniciar();
        await pronto();
        fireEvent.click(screen.getByText("Estado sem tarefa"));
        await alerta("Tarefa não encontrada");
    });
});