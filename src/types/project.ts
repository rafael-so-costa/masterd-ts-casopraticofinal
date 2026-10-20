export type TaskStatus = "pendente" | "em_progresso" | "concluida";

export interface ITask {
    id: string;
    titulo: string;
    descricao: string;
    dataConclusao: string;
    status: TaskStatus;
}

export interface IProject {
    id: string;
    nome: string;
    descricao: string;
    tarefas: ITask[];
}

export type ProjectInput = Pick<IProject, "nome" | "descricao">;
export type TaskInput = Omit<ITask, "id">;