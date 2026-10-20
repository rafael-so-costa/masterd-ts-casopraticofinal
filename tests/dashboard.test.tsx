import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectProvider } from "../src/context/ProjectContext";
import { Dashboard } from "../src/pages/Dashboard";

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("Dashboard", () => {
    it("mostra projetos obtidos da API", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => JSON.stringify([{
                id: "1",
                nome: "Projeto de teste",
                descricao: "Descrição",
                tarefas: []
            }])
        }));

        render(
            <MemoryRouter>
                <ProjectProvider>
                    <Dashboard/>
                </ProjectProvider>
            </MemoryRouter>
        );

        await waitFor(() =>
            expect(screen.getByText("Projeto de teste")).toBeTruthy()
        );

        expect(screen.getByText("Rafael Costa")).toBeTruthy();
    });
});