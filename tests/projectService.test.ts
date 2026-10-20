import { describe, it, expect, vi, afterEach } from "vitest";
import { projectService } from "../src/services/projectService";
import type { IProject } from "../src/types/project";

const projeto: IProject = {
    id: "p1",
    nome: "Projeto teste",
    descricao: "Descrição teste",
    tarefas: []
};

afterEach(() => {
    vi.unstubAllGlobals();
});

function mockApi(data: unknown, status = 200) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        text: async () => JSON.stringify(data)
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

describe("Serviço REST", () => {
    it("lista projetos", async () => {
        const fetchMock = mockApi([projeto]);
        const resultado = await projectService.listar();
        expect(resultado).toHaveLength(1);
        expect(resultado[0].nome).toBe("Projeto teste");
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("consulta projeto pelo ID", async () => {
        const fetchMock = mockApi(projeto);
        const resultado = await projectService.obter("p1");
        expect(resultado.id).toBe("p1");
        expect(fetchMock.mock.calls[0][0]).toContain("/projects/p1");
    });

    it("cria projeto através de POST", async () => {
        const fetchMock = mockApi(projeto, 201);
        const resultado = await projectService.criar(projeto);
        expect(resultado.nome).toBe(projeto.nome);
        expect(fetchMock.mock.calls[0][1].method).toBe("POST");
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(projeto);
    });

    it("edita projeto através de PATCH", async () => {
        const fetchMock = mockApi({ ...projeto, nome: "Alterado" });
        const resultado = await projectService.atualizar("p1", {
            nome: "Alterado"
        });
        expect(resultado.nome).toBe("Alterado");
        expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
    });

    it("elimina projeto através de DELETE", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 204,
            text: async () => ""
        });
        vi.stubGlobal("fetch", fetchMock);
        await expect(projectService.eliminar("p1")).resolves.toBeUndefined();
        expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
    });

    it("devolve erro HTTP", async () => {
        mockApi({ error: "Falha" }, 500);
        await expect(projectService.listar()).rejects.toThrow("HTTP 500");
    });

    it("devolve erro quando API está desligada", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(
            new Error("Connection refused")
        ));
        await expect(projectService.listar()).rejects.toThrow(
            "Sem ligação à API"
        );
    });
});