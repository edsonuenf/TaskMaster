CREATE TABLE projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    prioridade TEXT DEFAULT 'media',
    concluida BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas DISABLE ROW LEVEL SECURITY;
