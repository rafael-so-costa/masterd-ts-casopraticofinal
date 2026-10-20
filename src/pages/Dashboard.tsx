import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FolderKanban, ListTodo, CircleCheck, TrendingUp,
    RefreshCw, Plus, ArrowRight, Pencil, Trash2
} from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { Project } from "../models/Project";
import { Modal } from "../components/Modal";
import { ProjectForm } from "../components/ProjectForm";
import type { IProject, ProjectInput } from "../types/project";

export function Dashboard() {
    const {
        projetos, carregando, ocupado, erro, atualizar,
        criarProjeto, editarProjeto, excluirProjeto
    } = useProjects();

    const [form, setForm] = useState<IProject | "novo" | null>(null);
    const [feedback, setFeedback] = useState("");

    const tarefas = projetos.flatMap(p => p.tarefas);
    const concluidas = tarefas.filter(t => t.status === "concluida").length;
    const progresso = tarefas.length
        ? Math.round(concluidas / tarefas.length * 100) : 0;

    async function guardar(dados: ProjectInput) {
        if (form === "novo") await criarProjeto(dados);
        else if (form) await editarProjeto(form.id, dados);
        setForm(null);
        setFeedback("Projeto guardado com sucesso.");
    }

    async function apagar(projeto: IProject) {
        if (!window.confirm(`Eliminar o projeto "${projeto.nome}" e todas as suas tarefas?`)) return;
        try {
            await excluirProjeto(projeto.id);
            setFeedback("Projeto eliminado.");
        } catch (e) {
            setFeedback(e instanceof Error ? e.message : "Erro ao eliminar.");
        }
    }

    return (
        <main className="container">
            <header className="topo">
                <span className="marca">Rafael Costa</span>
            </header>

            <section className="cabecalho">
                <div>
                    <p className="sobretitulo">PAINEL DE CONTROLO</p>
                    <h1>Gestão de projetos</h1>
                    <p>Organize os seus projetos e acompanhe o progresso das tarefas.</p>
                </div>
                <div className="actions">
                    <button className="button secondary" onClick={() => void atualizar()}
                        disabled={carregando}>
                        <RefreshCw size={16}/> Atualizar
                    </button>
                    <button className="button" onClick={() => setForm("novo")}>
                        <Plus size={17}/> Novo projeto
                    </button>
                </div>
            </section>

            {erro && <p role="alert" className="error">{erro}</p>}
            {feedback && <p role="status" className="notice">{feedback}</p>}

            {carregando ? <p>A carregar projetos...</p> : (
                <>
                    <section className="indicadores">
                        <article className="indicador">
                            <FolderKanban/><span>Projetos</span>
                            <strong>{projetos.length}</strong>
                        </article>
                        <article className="indicador">
                            <ListTodo/><span>Total de tarefas</span>
                            <strong>{tarefas.length}</strong>
                        </article>
                        <article className="indicador">
                            <CircleCheck/><span>Tarefas concluídas</span>
                            <strong>{concluidas}</strong>
                        </article>
                        <article className="indicador">
                            <TrendingUp/><span>Progresso geral</span>
                            <strong>{progresso}%</strong>
                        </article>
                    </section>

                    <div className="secao-titulo">
                        <h2>Projetos</h2>
                        <span>{projetos.length} projetos</span>
                    </div>

                    {!projetos.length && (
                        <div className="empty">
                            Ainda não existem projetos. Clique em «Novo projeto».
                        </div>
                    )}

                    <section className="projetos">
                        {projetos.map(dados => {
                            const projeto = new Project(
                                dados.id, dados.nome, dados.descricao, dados.tarefas
                            );
                            const percentual = projeto.obterProgresso();

                            return (
                                <article className="cartao" key={projeto.id}>
                                    <div className="cartao-topo">
                                        <span className="icone-projeto">
                                            <FolderKanban size={20}/>
                                        </span>
                                        <div className="actions">
                                            <button className="icon-button"
                                                aria-label={`Editar ${projeto.nome}`}
                                                onClick={() => setForm(dados)}>
                                                <Pencil size={16}/>
                                            </button>
                                            <button className="icon-button danger"
                                                aria-label={`Eliminar ${projeto.nome}`}
                                                disabled={ocupado}
                                                onClick={() => void apagar(dados)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>

                                    <h3>{projeto.nome}</h3>
                                    <p>{projeto.descricao}</p>

                                    <div className="progresso-cabecalho">
                                        <span>Progresso</span>
                                        <strong>{percentual}%</strong>
                                    </div>
                                    <div className="barra">
                                        <div className="barra-preenchimento"
                                            style={{ width: `${percentual}%` }}/>
                                    </div>

                                    <div className="cartao-rodape">
                                        <span>{projeto.tarefas.length} tarefas</span>
                                        <Link to={`/projetos/${encodeURIComponent(projeto.id)}`}>
                                            Ver projeto <ArrowRight size={15}/>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                </>
            )}

            <footer>Rafael Costa · Gestão de Projetos</footer>

            {form && (
                <Modal titulo={form === "novo" ? "Novo projeto" : "Editar projeto"}
                    fechar={() => setForm(null)}>
                    <ProjectForm
                        initial={form === "novo" ? undefined : {
                            nome: form.nome, descricao: form.descricao
                        }}
                        submit={guardar}
                        cancel={() => setForm(null)}
                        loading={ocupado}/>
                </Modal>
            )}
        </main>
    );
}