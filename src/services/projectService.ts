import type { IProject } from "../types/project";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let resposta: Response;

    try {
        resposta = await fetch(`${BASE}${path}`, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...init?.headers
            }
        });
    } catch {
        throw new Error("Sem ligação à API. Execute npm run api.");
    }

    if (!resposta.ok) {
        throw new Error(`Operação não concluída (HTTP ${resposta.status}).`);
    }

    if (resposta.status === 204) return undefined as T;

    const texto = await resposta.text();
    return (texto ? JSON.parse(texto) : undefined) as T;
}

const path = (id: string) => `/projects/${encodeURIComponent(id)}`;

export const projectService = {
    listar: () => request<IProject[]>("/projects"),

    obter: (id: string) => request<IProject>(path(id)),

    criar: (projeto: IProject) => request<IProject>("/projects", {
        method: "POST",
        body: JSON.stringify(projeto)
    }),

    atualizar: (id: string, dados: Partial<IProject>) =>
        request<IProject>(path(id), {
            method: "PATCH",
            body: JSON.stringify(dados)
        }),

    eliminar: (id: string) =>
        request<void>(path(id), { method: "DELETE" })
};