import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Pencil, Trash2, CheckCircle, ArrowLeft } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { Project } from "../models/Project";
import { Modal } from "../components/Modal";
import { ProjectForm } from "../components/ProjectForm";
import { TaskForm } from "../components/TaskForm";
import type { ITask, ProjectInput, TaskInput, TaskStatus } from "../types/project";

const labels: Record<TaskStatus, string> = {
    pendente: "Pendente",
    em_progresso: "Em progresso",
    concluida: "Concluída"
};

export function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        projetos, carregando, ocupado, erro,
        editarProjeto, excluirProjeto, criarTarefa,
        editarTarefa, excluirTarefa, mudarEstado
    } = useProjects();

    const projetoAtual = projetos.find(p => p.id === id);
    const [editProject, setEditProject] = useState(false);
    const [editTask, setEditTask] = useState<ITask | "nova" | null>(null);
    const [mensagem, setMensagem] = useState("");

    if (carregando) {
        return <main className="container"><p>A carregar...</p></main>;
    }

    if (!projetoAtual) {
        return (
            <main className="container detalhe">
                <Link to="/">← Voltar</Link>
                <h1>Projeto não encontrado</h1>
                {erro && <p role="alert" className="error">{erro}</p>}
            </main>
        );
    }

    const p = projetoAtual;
    const modelo = new Project(p.id, p.nome, p.descricao, p.tarefas);

    async function guardarProjeto(dados: ProjectInput) {
        await editarProjeto(p.id, dados);
        setEditProject(false);
        setMensagem("Projeto atualizado.");
    }

    async function guardarTarefa(dados: TaskInput) {
        if (editTask === "nova") {
            await criarTarefa(p.id, dados);
        } else if (editTask) {
            await editarTarefa(p.id, editTask.id, dados);
        }
        setEditTask(null);
        setMensagem("Tarefa guardada.");
    }

    async function eliminarProjeto() {
        if (!window.confirm("Eliminar este projeto e todas as tarefas?")) return;
        try {
            await excluirProjeto(p.id);
            navigate("/");
        } catch (e) {
            setMensagem(e instanceof Error ? e.message : "Erro ao eliminar.");
        }
    }

    async function eliminarTarefa(t: ITask) {
        if (!window.confirm(`Eliminar a tarefa "${t.titulo}"?`)) return;
        try {
            await excluirTarefa(p.id, t.id);
            setMensagem("Tarefa eliminada.");
        } catch (e) {
            setMensagem(e instanceof Error ? e.message : "Erro ao eliminar.");
        }
    }

    async function alterarEstado(t: ITask, status: TaskStatus) {
        try {
            await mudarEstado(p.id, t.id, status);
            setMensagem("Estado atualizado.");
        } catch (e) {
            setMensagem(e instanceof Error ? e.message : "Erro ao atualizar.");
        }
    }

    return (
        <main className="container">
            <header className="topo">
                <Link className="marca" to="/">Rafael Costa</Link>
            </header>

            <div className="detalhe">
                <Link className="back" to="/">
                    <ArrowLeft size={16}/> Voltar ao dashboard
                </Link>

                <div className="cabecalho">
                    <div>
                        <h1>{p.nome}</h1>
                        <p>{p.descricao}</p>
                    </div>
                    <div className="actions">
                        <button className="button secondary"
                            onClick={() => setEditProject(true)}>
                            <Pencil size={15}/> Editar
                        </button>
                        <button className="button danger-button"
                            disabled={ocupado} onClick={() => void eliminarProjeto()}>
                            <Trash2 size={15}/> Eliminar
                        </button>
                    </div>
                </div>

                <section className="summary">
                    <strong>{p.tarefas.length} tarefas</strong>
                    <span>{p.tarefas.filter(t => t.status === "concluida").length} concluídas</span>
                    <strong>{modelo.obterProgresso()}% de progresso</strong>
                </section>

                <div className="barra">
                    <div className="barra-preenchimento"
                        style={{ width: `${modelo.obterProgresso()}%` }}/>
                </div>

                <div className="secao-titulo">
                    <h2>Tarefas</h2>
                    <button className="button" onClick={() => setEditTask("nova")}>
                        <Plus size={16}/> Nova tarefa
                    </button>
                </div>

                {erro && <p role="alert" className="error">{erro}</p>}
                {mensagem && <p role="status" className="notice">{mensagem}</p>}

                {!p.tarefas.length && (
                    <p className="empty">Este projeto ainda não tem tarefas.</p>
                )}

                <section className="task-list">
                    {p.tarefas.map(t => (
                        <article key={t.id} className={`tarefa status-${t.status}`}>
                            <div className="task-main">
                                <div>
                                    <span className={`pill status-${t.status}`}>
                                        {labels[t.status]}
                                    </span>
                                    <h3>{t.titulo}</h3>
                                    <p>{t.descricao}</p>
                                    <small>Data prevista: {t.dataConclusao}</small>
                                </div>

                                <div className="task-controls">
                                    <label>Estado
                                        <select aria-label={`Estado de ${t.titulo}`}
                                            disabled={ocupado}
                                            value={t.status}
                                            onChange={e => void alterarEstado(
                                                t, e.target.value as TaskStatus
                                            )}>
                                            <option value="pendente">Pendente</option>
                                            <option value="em_progresso">Em progresso</option>
                                            <option value="concluida">Concluída</option>
                                        </select>
                                    </label>

                                    <div className="actions">
                                        <button className="button secondary"
                                            onClick={() => setEditTask(t)}>
                                            <Pencil size={15}/> Editar
                                        </button>

                                        {t.status !== "concluida" && (
                                            <button className="button secondary"
                                                disabled={ocupado}
                                                onClick={() => void alterarEstado(t, "concluida")}>
                                                <CheckCircle size={15}/> Concluir
                                            </button>
                                        )}

                                        <button className="icon-button danger"
                                            disabled={ocupado}
                                            aria-label={`Eliminar tarefa ${t.titulo}`}
                                            onClick={() => void eliminarTarefa(t)}>
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            </div>

            {editProject && (
                <Modal titulo="Editar projeto" fechar={() => setEditProject(false)}>
                    <ProjectForm
                        initial={{ nome: p.nome, descricao: p.descricao }}
                        submit={guardarProjeto}
                        cancel={() => setEditProject(false)}
                        loading={ocupado}/>
                </Modal>
            )}

            {editTask && (
                <Modal titulo={editTask === "nova" ? "Nova tarefa" : "Editar tarefa"}
                    fechar={() => setEditTask(null)}>
                    <TaskForm
                        initial={editTask === "nova" ? undefined : {
                            titulo: editTask.titulo,
                            descricao: editTask.descricao,
                            dataConclusao: editTask.dataConclusao,
                            status: editTask.status
                        }}
                        submit={guardarTarefa}
                        cancel={() => setEditTask(null)}
                        loading={ocupado}/>
                </Modal>
            )}
        </main>
    );
}