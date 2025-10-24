/*
  # Sistema de Tarefas (To-Do)

  ## Descrição
  Cria um sistema completo de gerenciamento de tarefas para os usuários,
  permitindo vincular tarefas a imóveis e leads para melhor organização.

  ## Nova Tabela: tasks
  - id: identificador único
  - user_id: dono da tarefa
  - titulo: título da tarefa
  - descricao: descrição detalhada
  - prioridade: baixa, media, alta, urgente
  - status: pendente, em_andamento, concluida, cancelada
  - data_vencimento: prazo para conclusão
  - concluida_em: data/hora de conclusão
  - imovel_id: vinculação opcional com imóvel
  - lead_id: vinculação opcional com lead
  - recorrente: se a tarefa se repete
  - recorrencia_tipo: diario, semanal, mensal
  - tags: array de tags para categorização
  - created_at, updated_at

  ## Funcionalidades
  - Tarefas pessoais por usuário
  - Vinculação com imóveis e leads
  - Sistema de prioridades
  - Recorrência de tarefas
  - Notificações de vencimento (estrutura preparada)

  ## Segurança
  - RLS habilitado
  - Usuários só veem suas próprias tarefas
  - Admins podem ver todas as tarefas
*/

-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  descricao text DEFAULT '',
  prioridade text DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  data_vencimento timestamptz,
  concluida_em timestamptz,
  imovel_id uuid REFERENCES imoveis(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  recorrente boolean DEFAULT false,
  recorrencia_tipo text CHECK (recorrencia_tipo IN ('diario', 'semanal', 'mensal')),
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view own tasks" 
ON tasks FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" 
ON tasks FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" 
ON tasks FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" 
ON tasks FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Admins podem ver todas as tarefas
CREATE POLICY "Admins can view all tasks" 
ON tasks FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_prioridade ON tasks(prioridade);
CREATE INDEX IF NOT EXISTS idx_tasks_data_vencimento ON tasks(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_tasks_imovel_id ON tasks(imovel_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Função para marcar tarefa como concluída
CREATE OR REPLACE FUNCTION mark_task_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para concluida, registrar o timestamp
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    NEW.concluida_em := now();
  END IF;
  
  -- Se o status mudou de concluida para outro, limpar o timestamp
  IF NEW.status != 'concluida' AND OLD.status = 'concluida' THEN
    NEW.concluida_em := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar concluida_em automaticamente
DROP TRIGGER IF EXISTS task_completion_trigger ON tasks;
CREATE TRIGGER task_completion_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION mark_task_completed();
