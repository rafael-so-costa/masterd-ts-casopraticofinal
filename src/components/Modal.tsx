import type { ReactNode } from "react";

export function Modal({ titulo, children, fechar }: {
    titulo: string;
    children: ReactNode;
    fechar: () => void;
}) {
    return (
        <div className="overlay" role="presentation"
            onMouseDown={e => {
                if (e.target === e.currentTarget) fechar();
            }}>
            <section role="dialog" aria-modal="true"
                aria-label={titulo} className="modal">
                <div className="modal-head">
                    <h2>{titulo}</h2>
                    <button type="button" aria-label="Fechar"
                        className="button ghost" onClick={fechar}>×</button>
                </div>
                {children}
            </section>
        </div>
    );
}