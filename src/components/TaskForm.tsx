import { useState } from "react";
import type { FormEvent } from "react";
import type { TaskInput, TaskStatus } from "../types/project";
import { validarTarefa } from "../utils/validation";

const vazio: TaskInput = {
    titulo: "", descricao: "", dataConclusao: "", status: "pendente"
};

export function TaskForm({ initial = vazio, submit, cancel, loading }: {
    initial?: TaskInput;
    submit: (t: TaskInput) => Promise<void>;
    cancel: () => void;
    loading: boolean;
}) {
    const [titulo, setTitulo] = useState(initial.titulo);
    const [descricao, setDescricao] = useState(initial.descricao);
    const [dataConclusao, setData] = useState(initial.dataConclusao);
    const [status, setStatus] = useState<TaskStatus>(initial.status);
    const [erro, setErro] = useState("");

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const dados = { titulo, descricao, dataConclusao, status };
        const mensagem = validarTarefa(dados);

        if (mensagem) {
            setErro(mensagem);
            return;
        }

        try {
            setErro("");
            await submit(dados);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível guardar.");
        }
    };

    return (
        <form className="form" onSubmit={e => void onSubmit(e)}>
            <label>Título
                <input autoFocus maxLength={120} required value={titulo}
                    onChange={e => setTitulo(e.target.value)}/>
            </label>
            <label>Descrição
                <textarea rows={3} maxLength={500} required value={descricao}
                    onChange={e => setDescricao(e.target.value)}/>
            </label>
            <label>Data prevista
                <input type="date" required value={dataConclusao}
                    onChange={e => setData(e.target.value)}/>
            </label>
            <label>Estado
                <select value={status}
                    onChange={e => setStatus(e.target.value as TaskStatus)}>
                    <option value="pendente">Pendente</option>
                    <option value="em_progresso">Em progresso</option>
                    <option value="concluida">Concluída</option>
                </select>
            </label>
            {erro && <p role="alert" className="error">{erro}</p>}
            <div className="actions">
                <button type="button" className="button secondary"
                    onClick={cancel}>Cancelar</button>
                <button type="submit" disabled={loading} className="button">
                    {loading ? "A guardar..." : "Guardar tarefa"}
                </button>
            </div>
        </form>
    );
}