import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { IProject, ProjectInput, TaskInput, TaskStatus } from "../types/project";
import { projectService } from "../services/projectService";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import { validarProjeto, validarTarefa } from "../utils/validation";

interface ProjectContextValue {
    projetos: IProject[];
    carregando: boolean;
    ocupado: boolean;
    erro: string | null;
    atualizar: () => Promise<void>;
    criarProjeto: (dados: ProjectInput) => Promise<void>;
    editarProjeto: (id: string, dados: ProjectInput) => Promise<void>;
    excluirProjeto: (id: string) => Promise<void>;
    criarTarefa: (id: string, dados: TaskInput) => Promise<void>;
    editarTarefa: (pid: string, tid: string, dados: TaskInput) => Promise<void>;
    excluirTarefa: (pid: string, tid: string) => Promise<void>;
    mudarEstado: (pid: string, tid: string, status: TaskStatus) => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [projetos, setProjetos] = useState<IProject[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [ocupado, setOcupado] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const atualizar = useCallback(async () => {
        setCarregando(true);
        setErro(null);

        try {
            setProjetos(await projectService.listar());
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao obter projetos.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void atualizar();
    }, [atualizar]);

    const executar = async (fn: () => Promise<void>) => {
        setOcupado(true);
        setErro(null);

        try {
            await fn();
        } catch (e) {
            const mensagem = e instanceof Error ? e.message : "Operação falhou.";
            setErro(mensagem);
            throw new Error(mensagem);
        } finally {
            setOcupado(false);
        }
    };

    const criarProjeto = async (dados: ProjectInput) => executar(async () => {
        const erro = validarProjeto(dados);
        if (erro) throw new Error(erro);

        const projeto = new Project(
            crypto.randomUUID(),
            dados.nome.trim(),
            dados.descricao.trim()
        );

        const salvo = await projectService.criar(projeto.toJSON());
        setProjetos(prev => [...prev, salvo]);
    });

    const editarProjeto = async (id: string, dados: ProjectInput) => executar(async () => {
        const erro = validarProjeto(dados);
        if (erro) throw new Error(erro);

        const salvo = await projectService.atualizar(id, {
            nome: dados.nome.trim(),
            descricao: dados.descricao.trim()
        });

        setProjetos(prev => prev.map(p => p.id === id ? salvo : p));
    });

    const excluirProjeto = async (id: string) => executar(async () => {
        await projectService.eliminar(id);
        setProjetos(prev => prev.filter(p => p.id !== id));
    });

    const atualizarTarefas = async (id: string, mutar: (p: Project) => void) =>
        executar(async () => {
            const atual = projetos.find(p => p.id === id);
            if (!atual) throw new Error("Projeto não encontrado.");

            const modelo = new Project(
                atual.id, atual.nome, atual.descricao, atual.tarefas
            );

            mutar(modelo);

            const salvo = await projectService.atualizar(id, {
                tarefas: modelo.toJSON().tarefas
            });

            setProjetos(prev => prev.map(p => p.id === id ? salvo : p));
        });

    const criarTarefa = async (id: string, dados: TaskInput) => {
        const erro = validarTarefa(dados);
        if (erro) throw new Error(erro);

        await atualizarTarefas(id, p => p.adicionarTarefa(new Task(
            crypto.randomUUID(),
            dados.titulo.trim(),
            dados.descricao.trim(),
            dados.dataConclusao,
            dados.status
        )));
    };

    const editarTarefa = async (pid: string, tid: string, dados: TaskInput) => {
        const erro = validarTarefa(dados);
        if (erro) throw new Error(erro);

        await atualizarTarefas(pid, p => p.atualizarTarefa(new Task(
            tid, dados.titulo.trim(), dados.descricao.trim(),
            dados.dataConclusao, dados.status
        )));
    };

    const excluirTarefa = async (pid: string, tid: string) =>
        atualizarTarefas(pid, p => p.removerTarefa(tid));

    const mudarEstado = async (pid: string, tid: string, status: TaskStatus) =>
        atualizarTarefas(pid, p => {
            const tarefa = p.tarefas.find(t => t.id === tid);
            if (!tarefa) throw new Error("Tarefa não encontrada.");
            tarefa.atualizarStatus(status);
        });

    return (
        <ProjectContext.Provider value={{
            projetos, carregando, ocupado, erro, atualizar,
            criarProjeto, editarProjeto, excluirProjeto,
            criarTarefa, editarTarefa, excluirTarefa, mudarEstado
        }}>
            {children}
        </ProjectContext.Provider>
    );
}