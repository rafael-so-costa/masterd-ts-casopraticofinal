import { describe, it, expect } from "vitest";
import { Project } from "../src/models/Project";
import { Task } from "../src/models/Task";
import { validarProjeto, validarTarefa } from "../src/utils/validation";

const tarefa = (id: string, status: "pendente" | "concluida" = "pendente") =>
    new Task(id, "Desenvolver", "Descrição de teste", "2026-12-10", status);

describe("Modelos e validação", () => {
    it("compõe tarefas e calcula progresso", () => {
        const p = new Project("1", "Projeto", "Descrição");
        p.adicionarTarefa(tarefa("1", "concluida"));
        p.adicionarTarefa(tarefa("2"));
        expect(p.obterProgresso()).toBe(50);
    });

    it("atualiza, conclui e remove tarefas", () => {
        const p = new Project("1", "Projeto", "Descrição");
        p.adicionarTarefa(tarefa("1"));
        p.tarefas[0].concluir();
        expect(p.obterProgresso()).toBe(100);
        p.atualizarTarefa(tarefa("1", "pendente"));
        expect(p.obterProgresso()).toBe(0);
        p.removerTarefa("1");
        expect(p.tarefas).toHaveLength(0);
    });

    it("recusa IDs duplicados", () => {
        const p = new Project("1", "Projeto", "Descrição");
        p.adicionarTarefa(tarefa("1"));
        expect(() => p.adicionarTarefa(tarefa("1"))).toThrow();
    });

    it("valida projetos e tarefas", () => {
        expect(validarProjeto({ nome: "", descricao: "Teste" })).toBeTruthy();
        expect(validarTarefa({
            titulo: "T", descricao: "D",
            dataConclusao: "2026-02-30", status: "pendente"
        })).toBeTruthy();
    });

    it("serializa o modelo", () => {
        const p = new Project("1", "Projeto", "Descrição", [tarefa("1").toJSON()]);
        expect(p.toJSON().tarefas[0].id).toBe("1");
    });
});