import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { ProjectForm } from "../src/components/ProjectForm";
import { TaskForm } from "../src/components/TaskForm";
import { Modal } from "../src/components/Modal";

afterEach(() => {
    cleanup();
});

describe("Formulário de projetos", () => {
    it("mostra campos obrigatórios", () => {
        render(<ProjectForm submit={vi.fn()} cancel={vi.fn()} loading={false}/>);
        expect(screen.getByText("Nome do projeto")).toBeTruthy();
        expect(screen.getByText("Descrição")).toBeTruthy();
    });

    it("guarda projeto válido", async () => {
        const guardar = vi.fn().mockResolvedValue(undefined);
        render(<ProjectForm submit={guardar} cancel={vi.fn()} loading={false}/>);

        fireEvent.change(screen.getByLabelText("Nome do projeto"), {
            target: { value: "Novo projeto" }
        });
        fireEvent.change(screen.getByLabelText("Descrição"), {
            target: { value: "Descrição de teste" }
        });
        fireEvent.click(screen.getByText("Guardar projeto"));

        await waitFor(() => expect(guardar).toHaveBeenCalledWith({
            nome: "Novo projeto",
            descricao: "Descrição de teste"
        }));
    });

    it("apresenta erro devolvido pelo serviço", async () => {
        const guardar = vi.fn().mockRejectedValue(new Error("API indisponível"));
        render(<ProjectForm
            initial={{ nome: "Projeto", descricao: "Descrição" }}
            submit={guardar} cancel={vi.fn()} loading={false}
        />);
        fireEvent.click(screen.getByText("Guardar projeto"));
        await waitFor(() => expect(screen.getByRole("alert").textContent)
            .toContain("API indisponível"));
    });

    it("permite cancelar", () => {
        const cancelar = vi.fn();
        render(<ProjectForm submit={vi.fn()} cancel={cancelar} loading={false}/>);
        fireEvent.click(screen.getByText("Cancelar"));
        expect(cancelar).toHaveBeenCalledOnce();
    });
});

describe("Formulário de tarefas", () => {
    it("guarda tarefa válida", async () => {
        const guardar = vi.fn().mockResolvedValue(undefined);
        render(<TaskForm submit={guardar} cancel={vi.fn()} loading={false}/>);

        fireEvent.change(screen.getByLabelText("Título"), {
            target: { value: "Preparar relatório" }
        });
        fireEvent.change(screen.getByLabelText("Descrição"), {
            target: { value: "Descrição da tarefa" }
        });
        fireEvent.change(screen.getByLabelText("Data prevista"), {
            target: { value: "2026-12-10" }
        });
        fireEvent.change(screen.getByLabelText("Estado"), {
            target: { value: "em_progresso" }
        });
        fireEvent.click(screen.getByText("Guardar tarefa"));

        await waitFor(() => expect(guardar).toHaveBeenCalledWith({
            titulo: "Preparar relatório",
            descricao: "Descrição da tarefa",
            dataConclusao: "2026-12-10",
            status: "em_progresso"
        }));
    });

    it("apresenta erro de submissão", async () => {
        const guardar = vi.fn().mockRejectedValue(new Error("Erro na API"));
        render(<TaskForm
            initial={{
                titulo: "Tarefa",
                descricao: "Descrição",
                dataConclusao: "2026-12-10",
                status: "pendente"
            }}
            submit={guardar} cancel={vi.fn()} loading={false}
        />);
        fireEvent.click(screen.getByText("Guardar tarefa"));
        await waitFor(() => expect(screen.getByRole("alert").textContent)
            .toContain("Erro na API"));
    });
});

describe("Modal", () => {
    it("apresenta conteúdo e permite fechar", () => {
        const fechar = vi.fn();
        render(<Modal titulo="Novo projeto" fechar={fechar}>
            <p>Conteúdo de teste</p>
        </Modal>);
        expect(screen.getByText("Conteúdo de teste")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
        expect(fechar).toHaveBeenCalledOnce();
    });
});