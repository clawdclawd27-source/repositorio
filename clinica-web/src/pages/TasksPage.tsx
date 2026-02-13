import { useEffect, useState } from 'react';
import { api } from '../services/api';

type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  client?: { fullName?: string };
  assignedTo?: { name?: string };
};

const statusLabel: Record<TaskStatus, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluída',
  CANCELLED: 'Cancelada',
};

const priorityLabel: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

export function TasksPage() {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    setMsg('');
    try {
      const { data } = await api.get<Task[]>('/tasks');
      setItems(data || []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(task: Task) {
    setMsg('');
    try {
      await api.patch(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
      });
      setMsg(`Tarefa "${task.title}" atualizada.`);
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar tarefa');
    }
  }

  function updateLocal(id: string, patch: Partial<Task>) {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Tarefas</h2>
          <small style={{ color: '#7a2e65' }}>Painel administrativo para teste e edição · Total: {items.length}</small>
        </div>
        <button onClick={() => void load()} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar lista'}</button>
      </div>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.length === 0 && !loading ? <div>Nenhuma tarefa encontrada.</div> : null}
        {items.map((t) => (
          <div key={t.id} style={{ border: '1px solid #f0abfc', borderRadius: 12, padding: 12, display: 'grid', gap: 8 }}>
            <input value={t.title} onChange={(e) => updateLocal(t.id, { title: e.target.value })} />
            <input value={t.description || ''} placeholder="Descrição" onChange={(e) => updateLocal(t.id, { description: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <select value={t.status} onChange={(e) => updateLocal(t.id, { status: e.target.value as TaskStatus })}>
                {Object.keys(statusLabel).map((v) => (
                  <option key={v} value={v}>{statusLabel[v as TaskStatus]}</option>
                ))}
              </select>

              <select value={t.priority} onChange={(e) => updateLocal(t.id, { priority: e.target.value as TaskPriority })}>
                {Object.keys(priorityLabel).map((v) => (
                  <option key={v} value={v}>{priorityLabel[v as TaskPriority]}</option>
                ))}
              </select>

              <input
                type="date"
                value={t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : ''}
                onChange={(e) => updateLocal(t.id, { dueDate: e.target.value ? `${e.target.value}T12:00:00.000Z` : undefined })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <small>
                Cliente: {t.client?.fullName || '-'} · Responsável: {t.assignedTo?.name || '-'}
              </small>
              <button onClick={() => void save(t)}>Salvar edição</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
