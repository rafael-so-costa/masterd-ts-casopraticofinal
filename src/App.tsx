import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext";
import { Dashboard } from "./pages/Dashboard";
import { ProjectDetail } from "./pages/ProjectDetail";
import "./App.css";

export default function App() {
    return (
        <BrowserRouter>
            <ProjectProvider>
                <Routes>
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/projetos/:id" element={<ProjectDetail/>}/>
                    <Route path="*" element={
                        <main className="container">
                            <h1>Página não encontrada</h1>
                            <a href="/">Voltar</a>
                        </main>
                    }/>
                </Routes>
            </ProjectProvider>
        </BrowserRouter>
    );
}