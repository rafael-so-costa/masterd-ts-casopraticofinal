import { useState } from "react";
import type { FormEvent } from "react";
import type { ProjectInput } from "../types/project";
import { validarProjeto } from "../utils/validation";

export function ProjectForm({ initial = { nome: "", descricao: "" },
    submit, cancel, loading }: {
    initial?: ProjectInput;
    submit: (p: ProjectInput) => Promise<void>;
    cancel: () => void;
    loading: boolean;
}) {
    const [nome, setNome] = useState(initial.nome);
    const [descricao, setDescricao] = useState(initial.descricao);
    const [erro, setErro] = useState("");

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const dados = { nome, descricao };
        const mensagem = validarProjeto(dados);

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
            <label>Nome do projeto
                <input autoFocus value={nome} maxLength={100}
                    onChange={e => setNome(e.target.value)} required/>
            </label>
            <label>Descrição
                <textarea value={descricao} maxLength={500} rows={4}
                    onChange={e => setDescricao(e.target.value)} required/>
            </label>
            {erro && <p role="alert" className="error">{erro}</p>}
            <div className="actions">
                <button className="button secondary" type="button"
                    onClick={cancel}>Cancelar</button>
                <button className="button" disabled={loading} type="submit">
                    {loading ? "A guardar..." : "Guardar projeto"}
                </button>
            </div>
        </form>
    );
}