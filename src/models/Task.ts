import { Entity } from "./Entity";
import type { ITask, TaskStatus } from "../types/project";
import { validarTarefa } from "../utils/validation";

export class Task extends Entity implements ITask {
    public titulo: string;
    public descricao: string;
    public dataConclusao: string;
    public status: TaskStatus;

    constructor(
        id: string,
        titulo: string,
        descricao: string,
        dataConclusao: string,
        status: TaskStatus = "pendente"
    ) {
        super(id);

        const erro = validarTarefa({
            titulo,
            descricao,
            dataConclusao,
            status
        });

        if (erro) throw new Error(erro);

        this.titulo = titulo;
        this.descricao = descricao;
        this.dataConclusao = dataConclusao;
        this.status = status;
    }

    public concluir(): void {
        this.status = "concluida";
    }

    public atualizarStatus(status: TaskStatus): void {
        this.status = status;
    }

    public estaConcluida(): boolean {
        return this.status === "concluida";
    }

    public toJSON(): ITask {
        return {
            id: this.id,
            titulo: this.titulo,
            descricao: this.descricao,
            dataConclusao: this.dataConclusao,
            status: this.status
        };
    }
}