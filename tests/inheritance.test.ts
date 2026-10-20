import { describe, expect, it } from "vitest";
import { Entity } from "../src/models/Entity";
import { Project } from "../src/models/Project";
import { Task } from "../src/models/Task";

describe("Herança e composição TypeScript", () => {
    it("Project herda de Entity", () => {
        const projeto = new Project(
            "p1",
            "Projeto de teste",
            "Descrição de teste"
        );

        expect(projeto).toBeInstanceOf(Entity);
        expect(projeto.id).toBe("p1");
    });

    it("Task herda de Entity", () => {
        const tarefa = new Task(
            "t1",
            "Tarefa de teste",
            "Descrição de teste",
            "2026-12-10"
        );

        expect(tarefa).toBeInstanceOf(Entity);
        expect(tarefa.id).toBe("t1");
    });

    it("Project contém instâncias de Task", () => {
        const projeto = new Project(
            "p1",
            "Projeto de teste",
            "Descrição de teste",
            [{
                id: "t1",
                titulo: "Tarefa de teste",
                descricao: "Descrição de teste",
                dataConclusao: "2026-12-10",
                status: "pendente"
            }]
        );

        expect(projeto.tarefas[0]).toBeInstanceOf(Task);
        expect(projeto.tarefas[0]).toBeInstanceOf(Entity);
    });

    it("rejeita identificadores vazios", () => {
        expect(() => new Project(
            "",
            "Projeto",
            "Descrição"
        )).toThrow("identificador");

        expect(() => new Task(
            "",
            "Tarefa",
            "Descrição",
            "2026-12-10"
        )).toThrow("identificador");
    });

    it("preserva a serialização do projeto", () => {
        const projeto = new Project(
            "p1",
            "Projeto",
            "Descrição"
        );

        const tarefa = new Task(
            "t1",
            "Tarefa",
            "Descrição",
            "2026-12-10"
        );

        projeto.adicionarTarefa(tarefa);
        tarefa.concluir();

        const resultado = projeto.toJSON();

        expect(resultado.id).toBe("p1");
        expect(resultado.tarefas[0].id).toBe("t1");
        expect(resultado.tarefas[0].status).toBe("concluida");
        expect(projeto.obterProgresso()).toBe(100);
    });
});