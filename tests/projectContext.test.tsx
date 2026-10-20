import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProjectProvider } from "../src/context/ProjectContext";
import { useProjects } from "../src/hooks/useProjects";
import type { IProject, ITask } from "../src/types/project";

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

const inicial: IProject = {
    id: "p1",
    nome: "Projeto original",
    descricao: "Descrição original",
    tarefas: [{
        id: "t1",
        titulo: "Tarefa original",
        descricao: "Descrição da tarefa",
        dataConclusao: "2026-12-10",
        status: "pendente"
    }]
};

const novaTarefa = {
    titulo: "Nova tarefa",
    descricao: "Descrição nova",
    dataConclusao: "2026-12-15",
    status: "em_progresso" as const
};

function Painel() {
    const ctx = useProjects();
    return (
        <div>
            <span data-testid="quantidade">{ctx.projetos.length}</span>
            <span data-testid="ocupado">{String(ctx.ocupado)}</span>
            <span data-testid="nome">{ctx.projetos[0]?.nome ?? ""}</span>
            <span data-testid="tarefas">{ctx.projetos[0]?.tarefas.length ?? 0}</span>
            <span data-testid="estado">{ctx.projetos[0]?.tarefas[0]?.status ?? ""}</span>
            {ctx.erro && <p role="alert">{ctx.erro}</p>}
            <button onClick={() => void ctx.atualizar()}>Atualizar</button>
            <button onClick={() => void ctx.criarProjeto({
                nome: "Projeto novo", descricao: "Descrição nova"
            })}>Criar projeto</button>
            <button onClick={() => void ctx.editarProjeto("p1", {
                nome: "Projeto editado", descricao: "Descrição editada"
            })}>Editar projeto</button>
            <button onClick={() => void ctx.excluirProjeto("p1")}>Eliminar projeto</button>
            <button onClick={() => void ctx.criarTarefa("p1", novaTarefa)}>
                Criar tarefa
            </button>
            <button onClick={() => void ctx.editarTarefa("p1", "t1", novaTarefa)}>
                Editar tarefa
            </button>
            <button onClick={() => void ctx.excluirTarefa("p1", "t1")}>
                Eliminar tarefa
            </button>
            <button onClick={() => void ctx.mudarEstado("p1", "t1", "concluida")}>
                Concluir tarefa
            </button>
        </div>
    );
}

function iniciar() {
    return render(<ProjectProvider><Painel/></ProjectProvider>);
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.listar.mockResolvedValue([structuredClone(inicial)]);
    mocks.criar.mockImplementation(async (p: IProject) => p);
    mocks.atualizar.mockImplementation(async (id: string, dados: Partial<IProject>) =>
        ({ ...structuredClone(inicial), ...dados, id })
    );
    mocks.eliminar.mockResolvedValue(undefined);
});

afterEach(cleanup);

describe("ProjectContext - integração", () => {
    it("carrega projetos através da API", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("quantidade").textContent).toBe("1"));
        expect(mocks.listar).toHaveBeenCalled();
    });

    it("atualiza a lista manualmente", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("quantidade").textContent).toBe("1"));
        fireEvent.click(screen.getByText("Atualizar"));
        await waitFor(() => expect(mocks.listar).toHaveBeenCalledTimes(2));
    });

    it("cria projeto e atualiza estado local", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("quantidade").textContent).toBe("1"));
        fireEvent.click(screen.getByText("Criar projeto"));
        await waitFor(() => expect(screen.getByTestId("quantidade").textContent).toBe("2"));
        expect(mocks.criar).toHaveBeenCalledOnce();
    });

    it("edita projeto e mantém a lista sincronizada", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("nome").textContent).toBe("Projeto original"));
        fireEvent.click(screen.getByText("Editar projeto"));
        await waitFor(() => expect(screen.getByTestId("nome").textContent).toBe("Projeto editado"));
        expect(mocks.atualizar).toHaveBeenCalledWith("p1", {
            nome: "Projeto editado",
            descricao: "Descrição editada"
        });
    });

    it("elimina projeto", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("quantidade").textContent).toBe("1"));
        fireEvent.click(screen.getByText("Eliminar projeto"));
        await waitFor(() => expect(screen.getByTestId("quantidade").textContent).toBe("0"));
        expect(mocks.eliminar).toHaveBeenCalledWith("p1");
    });

    it("adiciona tarefa a um projeto existente", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("tarefas").textContent).toBe("1"));
        fireEvent.click(screen.getByText("Criar tarefa"));
        await waitFor(() => expect(screen.getByTestId("tarefas").textContent).toBe("2"));
        expect(mocks.atualizar).toHaveBeenCalledOnce();
        const payload = mocks.atualizar.mock.calls[0][1] as { tarefas: ITask[] };
        expect(payload.tarefas[1].titulo).toBe("Nova tarefa");
    });

    it("edita uma tarefa", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("tarefas").textContent).toBe("1"));
        fireEvent.click(screen.getByText("Editar tarefa"));
        await waitFor(() => expect(screen.getByTestId("estado").textContent).toBe("em_progresso"));
        const payload = mocks.atualizar.mock.calls[0][1] as { tarefas: ITask[] };
        expect(payload.tarefas[0].id).toBe("t1");
        expect(payload.tarefas[0].titulo).toBe("Nova tarefa");
    });

    it("elimina uma tarefa", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("tarefas").textContent).toBe("1"));
        fireEvent.click(screen.getByText("Eliminar tarefa"));
        await waitFor(() => expect(screen.getByTestId("tarefas").textContent).toBe("0"));
    });

    it("marca tarefa como concluída", async () => {
        iniciar();
        await waitFor(() => expect(screen.getByTestId("estado").textContent).toBe("pendente"));
        fireEvent.click(screen.getByText("Concluir tarefa"));
        await waitFor(() => expect(screen.getByTestId("estado").textContent).toBe("concluida"));
    });

    it("mostra erro quando a listagem falha", async () => {
        mocks.listar.mockRejectedValue(new Error("API indisponível"));
        iniciar();
        await waitFor(() =>
            expect(screen.getByRole("alert").textContent).toContain("API indisponível")
        );
    });
});