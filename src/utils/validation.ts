import type { ProjectInput, TaskInput, TaskStatus } from "../types/project";

export const estados: TaskStatus[] = ["pendente", "em_progresso", "concluida"];

export function dataValida(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const data = new Date(`${valor}T12:00:00Z`);
    return !Number.isNaN(data.getTime()) &&
        data.toISOString().slice(0, 10) === valor;
}

export function validarProjeto(p: ProjectInput): string | null {
    if (!p.nome.trim()) return "Introduza o nome do projeto.";
    if (p.nome.trim().length > 100) return "O nome não pode exceder 100 caracteres.";
    if (!p.descricao.trim()) return "Introduza a descrição do projeto.";
    if (p.descricao.trim().length > 500) return "A descrição não pode exceder 500 caracteres.";
    return null;
}

export function validarTarefa(t: TaskInput): string | null {
    if (!t.titulo.trim()) return "Introduza o título da tarefa.";
    if (t.titulo.trim().length > 120) return "O título não pode exceder 120 caracteres.";
    if (!t.descricao.trim()) return "Introduza a descrição da tarefa.";
    if (t.descricao.trim().length > 500) return "A descrição não pode exceder 500 caracteres.";
    if (!dataValida(t.dataConclusao)) return "Introduza uma data válida.";
    if (!estados.includes(t.status)) return "Escolha um estado válido.";
    return null;
}