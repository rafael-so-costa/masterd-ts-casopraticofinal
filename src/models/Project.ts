import { Entity } from "./Entity";
import { Task } from "./Task";
import type { IProject, ITask } from "../types/project";
import { validarProjeto } from "../utils/validation";

export class Project extends Entity implements IProject {
    public nome: string;
    public descricao: string;
    public tarefas: Task[];

    constructor(
        id: string,
        nome: string,
        descricao: string,
        tarefas: ITask[] = []
    ) {
        super(id);

        const erro = validarProjeto({ nome, descricao });
        if (erro) throw new Error(erro);

        this.nome = nome;
        this.descricao = descricao;

        this.tarefas = tarefas.map(t => new Task(
            t.id,
            t.titulo,
            t.descricao,
            t.dataConclusao,
            t.status
        ));
    }

    public adicionarTarefa(tarefa: Task): void {
        if (this.tarefas.some(t => t.id === tarefa.id)) {
            throw new Error("Tarefa duplicada.");
        }

        this.tarefas.push(tarefa);
    }

    public atualizarTarefa(tarefa: Task): void {
        const index = this.tarefas.findIndex(t => t.id === tarefa.id);

        if (index < 0) {
            throw new Error("Tarefa não encontrada.");
        }

        this.tarefas[index] = tarefa;
    }

    public removerTarefa(id: string): void {
        this.tarefas = this.tarefas.filter(t => t.id !== id);
    }

    public obterProgresso(): number {
        if (!this.tarefas.length) return 0;

        const concluidas = this.tarefas.filter(
            t => t.estaConcluida()
        ).length;

        return Math.round(
            concluidas / this.tarefas.length * 100
        );
    }

    public toJSON(): IProject {
        return {
            id: this.id,
            nome: this.nome,
            descricao: this.descricao,
            tarefas: this.tarefas.map(t => t.toJSON())
        };
    }
}