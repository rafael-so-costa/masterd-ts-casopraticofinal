# Gestão de Projetos — CPT0040

**Autor:** Rafael Costa

Aplicação de gestão de projetos e tarefas desenvolvida com TypeScript, React e Vite, no âmbito do Caso Prático CPT0040 da Master D.

## Objetivo

Disponibilizar uma aplicação web simples, responsiva e funcional que permita criar projetos, organizar tarefas e acompanhar o progresso de execução.

## Tecnologias

- TypeScript
- React
- Vite
- React Router
- Context API e Custom Hooks
- JSON Server — API REST simulada
- Vitest
- React Testing Library
- CSS responsivo
- Lucide React

## Funcionalidades

### Dashboard

- Listagem de projetos.
- Indicadores de projetos e tarefas.
- Progresso geral.
- Progresso individual de cada projeto.
- Criação, edição e eliminação de projetos.

### Projetos

Cada projeto contém:

- Identificador único.
- Nome.
- Descrição.
- Lista de tarefas.

### Tarefas

Cada tarefa contém:

- Identificador único.
- Título.
- Descrição.
- Data prevista de conclusão.
- Estado: pendente, em progresso ou concluída.

Operações disponíveis:

- Criar tarefas.
- Editar tarefas.
- Eliminar tarefas.
- Alterar estado.
- Marcar como concluída.

### Validações

São efetuadas validações dos campos obrigatórios, comprimentos máximos, datas e estados. A interface apresenta mensagens em caso de erro.

## Instalação

### Requisitos

- Node.js e npm compatíveis com a versão do Vite instalada.

### Passos

Na pasta do projeto:

```bash
npm install
```

Iniciar a API REST:

```bash
npm run api
```

Por predefinição, o JSON Server utiliza:

http://localhost:3001

Num segundo terminal:

```bash
npm run dev
```

Abrir o endereço local apresentado pelo Vite.

## API REST

O JSON Server utiliza o ficheiro `db.json`.

Endpoint principal:

```text
GET    /projects
GET    /projects/:id
POST   /projects
PATCH  /projects/:id
DELETE /projects/:id
```

As tarefas são guardadas na propriedade `tarefas` de cada projeto. A alteração das tarefas é persistida através de `PATCH` no projeto correspondente.

A API é simulada e destinada à demonstração e avaliação académica.

## Arquitetura

```text
src/
  components/  Componentes reutilizáveis e formulários
  context/     Gestão de estado com Context API
  hooks/       Hooks personalizados
  models/      Classes e regras orientadas a objetos
  pages/       Dashboard e detalhes do projeto
  services/    Comunicação REST
  types/       Interfaces e tipos TypeScript
  utils/       Funções de validação
tests/         Testes unitários e de integração
db.json        Dados da API simulada
```

## TypeScript avançado

### Classes

As entidades principais são representadas pelas classes `Project` e `Task`.

### Interfaces

As interfaces `IProject` e `ITask` definem os contratos dos dados.

### Herança

A classe abstrata `Entity` centraliza a identificação das entidades.

As classes `Project` e `Task` herdam de `Entity`.

### Composição

Um objeto `Project` contém uma coleção de objetos `Task`.

### Tipos

A aplicação utiliza tipos de união, interfaces, tipos derivados como `Pick` e `Omit`, genéricos e assinaturas tipadas.

## React

A aplicação utiliza componentes funcionais.

O estado global é gerido pelo `ProjectProvider`, através da Context API.

O Custom Hook `useProjects` permite aos componentes consumir as funcionalidades de gestão de projetos e tarefas.

No React, a reutilização de lógica é demonstrada através dos Hooks personalizados, em alternativa aos decorators específicos do Angular.

## Testes

Executar todos os testes:

```bash
npm run test:run
```

Gerar cobertura:

```bash
npm run test:coverage
```

Compilar para produção:

```bash
npm run build
```

A aplicação utiliza Vitest e React Testing Library para validar modelos, formulários, serviços REST, componentes e operações de gestão.

Os resultados devem ser confirmados executando os comandos acima. Não são fixados valores de cobertura neste documento, pois podem mudar com alterações posteriores ao código.

## Decisões de desenvolvimento

Foi escolhido React com TypeScript para permitir uma arquitetura modular, baseada em componentes e Hooks.

A interface foi mantida simples e responsiva, priorizando clareza e facilidade de utilização.

O JSON Server foi escolhido para demonstrar persistência REST sem depender de um backend externo.

A separação entre modelos, serviços, estado e componentes facilita manutenção e evolução.

## Limitações

A aplicação corresponde a um MVP académico.

Não inclui autenticação, permissões de utilizadores nem uma base de dados de produção.

O JSON Server deve ser iniciado separadamente da aplicação React.

## Autor

Rafael Costa