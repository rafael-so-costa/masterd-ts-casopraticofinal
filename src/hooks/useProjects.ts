import { useContext } from "react";
import { ProjectContext } from "../context/ProjectContext";

export function useProjects() {
    const contexto = useContext(ProjectContext);
    if (!contexto) throw new Error("ProjectProvider em falta.");
    return contexto;
}