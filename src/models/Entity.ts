export abstract class Entity {
    public readonly id: string;

    protected constructor(id: string) {
        if (!id.trim()) {
            throw new Error("O identificador é obrigatório.");
        }
        this.id = id;
    }
}