# CPT0040 — Matriz de Conformidade com os Requisitos da Master D

**Projeto:** Gestão de Projetos com TypeScript e React  
**Autor:** Rafael Costa  
**Repositório:** https://github.com/rafael-so-costa/masterd-ts-casopraticofinal

## 1. Objetivo

Este documento relaciona os requisitos do Caso Prático CPT0040 com os ficheiros, os elementos de código e as funcionalidades desenvolvidas.

A aplicação foi construída em React com TypeScript e utiliza uma API REST simulada através do JSON Server.

## 2. Critérios de avaliação

| Critério | Peso |
|---|---:|
| Implementação funcional | 40% |
| Utilização de TypeScript | 30% |
| Estrutura e arquitetura | 20% |
| Testes e qualidade de código | 10% |

## 3. Requisitos funcionais

| ID | Requisito | Ficheiro | Código de referência | Explicação |
|---|---|---|---|---|
| RF01 | Listar projetos no dashboard | `src/pages/Dashboard.tsx` | `projetos.map(dados => ...)` | Percorre os projetos obtidos da API e apresenta um cartão para cada um. |
| RF02 | Criar novos projetos | `src/pages/Dashboard.tsx` e `src/context/ProjectContext.tsx` | `setForm("novo")`, `criarProjeto(dados)` | Abre o formulário, valida os dados e cria um projeto através da API. |
| RF03 | Editar projetos | `src/context/ProjectContext.tsx` | `editarProjeto(id, dados)` | Atualiza o nome e a descrição, mantendo a identidade do projeto. |
| RF04 | Eliminar projetos | `src/context/ProjectContext.tsx` | `excluirProjeto(id)` | Elimina o projeto através da API e retira-o do estado global. |
| RF05 | Nome e descrição do projeto | `src/types/project.ts` | `IProject` | Define os atributos do projeto através de uma interface TypeScript. |
| RF06 | Associar tarefas a um projeto | `src/models/Project.ts` | `public tarefas: Task[]` | Aplica composição, mantendo objetos Task dentro de Project. |
| RF07 | Mostrar resumo das tarefas | `src/pages/Dashboard.tsx` | `projeto.tarefas.length` | Indica a quantidade de tarefas de cada projeto. |
| RF08 | Mostrar progresso | `src/models/Project.ts` | `obterProgresso()` | Calcula a percentagem de tarefas concluídas. |
| RF09 | Adicionar tarefas | `src/context/ProjectContext.tsx` | `criarTarefa(id, dados)` | Cria uma nova tarefa com identificador único e associa-a ao projeto. |
| RF10 | Editar tarefas | `src/context/ProjectContext.tsx` | `editarTarefa(pid, tid, dados)` | Substitui os dados de uma tarefa existente. |
| RF11 | Remover tarefas | `src/context/ProjectContext.tsx` | `excluirTarefa(pid, tid)` | Remove a tarefa da coleção do projeto. |
| RF12 | Definir título e descrição | `src/types/project.ts` | `ITask` | Estabelece os campos de texto exigidos para as tarefas. |
| RF13 | Definir data prevista | `src/types/project.ts` e `src/utils/validation.ts` | `dataConclusao`, `dataValida(valor)` | Regista a data e valida o formato e a existência da data. |
| RF14 | Definir estado da tarefa | `src/types/project.ts` | `TaskStatus` | Restringe o estado a pendente, em progresso ou concluída. |
| RF15 | Marcar tarefa como concluída | `src/pages/ProjectDetail.tsx` | `alterarEstado(t, "concluida")` | O botão Concluir atualiza o estado através do Context API. |
| RF16 | Validar projetos | `src/utils/validation.ts` | `validarProjeto(p)` | Verifica nome, descrição e comprimentos máximos. |
| RF17 | Validar tarefas | `src/utils/validation.ts` | `validarTarefa(t)` | Verifica título, descrição, data e estado. |
| RF18 | Mostrar erros | `src/context/ProjectContext.tsx` e `src/pages/ProjectDetail.tsx` | `setErro(mensagem)`, `role="alert"` | Apresenta mensagens quando uma operação falha. |
| RF19 | Estilização da interface | `src/App.css` | Classes `container`, `cartao`, `barra` | Organiza a apresentação visual do dashboard e dos detalhes. |
| RF20 | Distinguir estados visualmente | `src/pages/ProjectDetail.tsx` | ``className={`pill status-${t.status}`}`` | Aplica classes CSS diferentes conforme o estado de cada tarefa. |
| RF21 | Interface responsiva | `src/App.css` | Estilos CSS da aplicação | Permite adaptar a apresentação a diferentes larguras de ecrã; requer confirmação visual final. |

## 4. Requisitos técnicos

| ID | Requisito | Ficheiro | Código de referência | Explicação |
|---|---|---|---|---|
| RT01 | Utilizar TypeScript | `src/` | Ficheiros `.ts` e `.tsx` | A aplicação utiliza tipagem estática em modelos, serviços, componentes e estado. |
| RT02 | Implementar Project | `src/models/Project.ts` | `class Project extends Entity implements IProject` | Modela o projeto e os comportamentos sobre as suas tarefas. |
| RT03 | Implementar Task | `src/models/Task.ts` | `class Task extends Entity implements ITask` | Modela uma tarefa, o seu estado e a serialização. |
| RT04 | Aplicar herança | `src/models/Entity.ts` | `abstract class Entity` | Centraliza a propriedade id, reutilizada pelas classes Project e Task. |
| RT05 | Aplicar composição | `src/models/Project.ts` | `tarefas.map(t => new Task(...))` | Constrói instâncias Task associadas ao objeto Project. |
| RT06 | Utilizar interfaces | `src/types/project.ts` | `IProject`, `ITask` | Define os contratos dos objetos e dos modelos. |
| RT07 | Utilizar tipos avançados | `src/types/project.ts` | `Pick`, `Omit`, `TaskStatus` | Demonstra tipos derivados e união de literais. |
| RT08 | Utilizar React | `src/pages/` e `src/components/` | Componentes funcionais | Estrutura a aplicação em unidades reutilizáveis. |
| RT09 | Gestão de estado global | `src/context/ProjectContext.tsx` | `createContext`, `ProjectProvider` | Centraliza dados, carregamento, erros e operações CRUD. |
| RT10 | Reutilização de lógica | `src/hooks/useProjects.ts` | `useProjects()` | Disponibiliza acesso ao contexto por meio de um Custom Hook. |
| RT11 | Integrar uma API RESTful | `src/services/projectService.ts` | `fetch(...)` | Efetua pedidos HTTP para leitura e persistência. |
| RT12 | Persistir projetos | `src/services/projectService.ts` e `db.json` | `POST`, `PATCH`, `DELETE` | O JSON Server persiste os projetos e as tarefas no ficheiro JSON. |
| RT13 | Tratamento de falhas da API | `src/services/projectService.ts` | `if (!resposta.ok) throw new Error(...)` | Trata respostas HTTP com erro e falhas de ligação. |
| RT14 | Navegação entre páginas | `src/pages/Dashboard.tsx` e `src/pages/ProjectDetail.tsx` | `Link`, `useParams`, `useNavigate` | Permite navegar entre a listagem e os detalhes de cada projeto. |

## 5. Exemplos concretos de código

### 5.1. Interfaces e tipos derivados

Ficheiro: `src/types/project.ts`

```typescript
export type TaskStatus = "pendente" | "em_progresso" | "concluida";

export interface ITask {
    id: string;
    titulo: string;
    descricao: string;
    dataConclusao: string;
    status: TaskStatus;
}

export interface IProject {
    id: string;
    nome: string;
    descricao: string;
    tarefas: ITask[];
}

export type ProjectInput = Pick<IProject, "nome" | "descricao">;
export type TaskInput = Omit<ITask, "id">;
```

As interfaces definem a estrutura dos dados, enquanto Pick e Omit permitem criar novos tipos a partir dos existentes.

### 5.2. Herança

Ficheiros: `src/models/Entity.ts`, `Project.ts` e `Task.ts`.

```typescript
export abstract class Entity {
    public readonly id: string;

    protected constructor(id: string) {
        if (!id.trim()) {
            throw new Error("O identificador é obrigatório.");
        }
        this.id = id;
    }
}
```

```typescript
export class Project extends Entity implements IProject {
    // Propriedades e comportamentos do projeto
}
```

```typescript
export class Task extends Entity implements ITask {
    // Propriedades e comportamentos da tarefa
}
```

O identificador é definido numa classe base abstrata. As entidades especializadas herdam esse atributo e implementam contratos específicos.

### 5.3. Composição

Ficheiro: `src/models/Project.ts`.

```typescript
this.tarefas = tarefas.map(t => new Task(
    t.id,
    t.titulo,
    t.descricao,
    t.dataConclusao,
    t.status
));
```

A classe Project contém uma coleção de objetos da classe Task, demonstrando a composição entre objetos.

### 5.4. Cálculo de progresso

Ficheiro: `src/models/Project.ts`.

```typescript
public obterProgresso(): number {
    if (!this.tarefas.length) return 0;

    const concluidas = this.tarefas.filter(
        t => t.estaConcluida()
    ).length;

    return Math.round(
        concluidas / this.tarefas.length * 100
    );
}
```

O cálculo divide a quantidade de tarefas concluídas pelo total de tarefas e converte o resultado em percentagem.

### 5.5. Validação

Ficheiro: `src/utils/validation.ts`.

```typescript
export function validarProjeto(p: ProjectInput): string | null {
    if (!p.nome.trim()) return "Introduza o nome do projeto.";
    if (p.nome.trim().length > 100)
        return "O nome não pode exceder 100 caracteres.";
    if (!p.descricao.trim())
        return "Introduza a descrição do projeto.";
    if (p.descricao.trim().length > 500)
        return "A descrição não pode exceder 500 caracteres.";
    return null;
}
```

A função devolve uma mensagem de erro quando os dados são inválidos e null quando cumprem as regras.

### 5.6. Custom Hook

Ficheiro: `src/hooks/useProjects.ts`.

```typescript
export function useProjects() {
    const contexto = useContext(ProjectContext);
    if (!contexto) throw new Error("ProjectProvider em falta.");
    return contexto;
}
```

O Hook oferece um ponto de acesso reutilizável ao estado global, demonstrando o padrão de reutilização de lógica recomendado para React.

### 5.7. API REST

Ficheiro: `src/services/projectService.ts`.

```typescript
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
```

O serviço concentra a comunicação com a API REST, separando a persistência da interface.

## 6. Testes e qualidade

| Área | Ficheiro |
|---|---|
| Classes e operações | `tests/models.test.ts` |
| Herança e composição | `tests/inheritance.test.ts` |
| Validações | `tests/validation.test.ts` |
| Comunicação REST | `tests/projectService.test.ts` |
| Dashboard | `tests/dashboard.test.tsx` |
| Formulários | `tests/forms.test.tsx` |
| Context API | `tests/projectContext.test.tsx` |
| Detalhes do projeto | `tests/projectDetail.test.tsx` |
| Ramificações do contexto | `tests/branchesContext.test.tsx` |
| Ramificações do dashboard | `tests/branchesDashboard.test.tsx` |
| Ramificações dos detalhes | `tests/branchesProjectDetail.test.tsx` |

A configuração dos testes está em `vitest.config.ts`, utilizando Vitest, jsdom e cobertura V8.

### Últimos resultados automatizados

| Métrica | Resultado |
|---|---:|
| Testes | 88 aprovados |
| Instruções | 95,01% |
| Ramificações | 85,13% |
| Funções | 93,33% |
| Linhas | 96,00% |

Estes são os resultados da última execução comunicada, não uma medição realizada por este documento.

## 7. Projetos demonstrativos

A base de dados `db.json` contém projetos com exemplos de tarefas nos três estados.

| Projeto | Tarefas | Concluídas | Em progresso | Pendentes | Progresso |
|---|---:|---:|---:|---:|---:|
| Website Corporativo | 8 | 3 | 3 | 2 | 38% |
| Aplicação Mobile | 8 | 2 | 3 | 3 | 25% |

Pode existir um projeto adicional de teste criado durante a validação manual.

## 8. Pontos de verificação manual

Antes da entrega final, recomenda-se confirmar:

1. Criação, edição e eliminação de projetos.
2. Criação, edição e eliminação de tarefas.
3. Alteração de estado e atualização da percentagem de progresso.
4. Persistência das alterações após recarregar a página.
5. Validações e mensagens de erro.
6. Apresentação em dispositivos móveis.

## 9. Entrega

O código-fonte está organizado num repositório Git com documentação README e histórico de commits.

O projeto pode ser executado com dois processos:

```bash
npm run api
npm run dev
```

A execução dos testes e a compilação são feitas com:

```bash
npm run test:run
npm run test:coverage
npm run build
```

O JSON Server é utilizado como API simulada, permitindo executar o trabalho em ambiente local sem dependência de uma API de produção.

## 10. Conclusão

O projeto demonstra gestão de projetos e tarefas, utilização de TypeScript, classes, interfaces, herança, composição, React, Custom Hooks, Context API, integração REST e testes automatizados.

A matriz documenta a correspondência entre os requisitos do Caso Prático CPT0040 e as implementações existentes no código-fonte.