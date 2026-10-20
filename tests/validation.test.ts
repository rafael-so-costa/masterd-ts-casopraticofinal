import { describe, it, expect } from "vitest";
import {
    validarProjeto,
    validarTarefa,
    dataValida
} from "../src/utils/validation";
import type { TaskInput } from "../src/types/project";

const tarefa: TaskInput = {
    titulo: "Preparar relatório",
    descricao: "Descrição válida",
    dataConclusao: "2026-12-10",
    status: "pendente"
};

describe("Validação de projetos", () => {
    it("aceita dados válidos", () => {
        expect(validarProjeto({
            nome: "Projeto A",
            descricao: "Descrição A"
        })).toBeNull();
    });

    it("recusa nome vazio", () => {
        expect(validarProjeto({
            nome: "  ",
            descricao: "Descrição"
        })).toContain("nome");
    });

    it("recusa descrição vazia", () => {
        expect(validarProjeto({
            nome: "Projeto",
            descricao: ""
        })).toContain("descrição");
    });

    it("recusa nomes e descrições longas", () => {
        expect(validarProjeto({
            nome: "X".repeat(101),
            descricao: "Descrição"
        })).not.toBeNull();

        expect(validarProjeto({
            nome: "Projeto",
            descricao: "X".repeat(501)
        })).not.toBeNull();
    });
});

describe("Validação de tarefas", () => {
    it("aceita tarefa válida", () => {
        expect(validarTarefa(tarefa)).toBeNull();
    });

    it("recusa título vazio", () => {
        expect(validarTarefa({
            ...tarefa, titulo: ""
        })).not.toBeNull();
    });

    it("recusa descrição vazia", () => {
        expect(validarTarefa({
            ...tarefa, descricao: ""
        })).not.toBeNull();
    });

    it("recusa campos demasiado longos", () => {
        expect(validarTarefa({
            ...tarefa, titulo: "X".repeat(121)
        })).not.toBeNull();

        expect(validarTarefa({
            ...tarefa, descricao: "X".repeat(501)
        })).not.toBeNull();
    });

    it("recusa datas inválidas", () => {
        expect(dataValida("2026-02-30")).toBe(false);
        expect(dataValida("texto")).toBe(false);
        expect(dataValida("2026-12-10")).toBe(true);
    });

    it("recusa estados desconhecidos", () => {
        expect(validarTarefa({
            ...tarefa,
            status: "invalido" as TaskInput["status"]
        })).not.toBeNull();
    });
});