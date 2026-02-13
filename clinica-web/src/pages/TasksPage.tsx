import { useEffect, useMemo, useState } from 'react';
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
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | TaskStatus>('ALL');

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

  const visible = useMemo(() => {
    return items.filter((t) => {
      const byStatus = filterStatus === 'ALL' ? true : t.status === filterStatus;
      const haystack = `${t.title} ${t.description || ''} ${t.client?.fullName || ''}`.toLowerCase();
      const byQuery = haystack.includes(query.trim().toLowerCase());
      return byStatus && byQuery;
    });
  }, [items, query, filterStatus]);

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
    <div className="tasks-page">
      <div className="tasks-head card">
        <div>
          <h2>Tarefas</h2>
          <p>Painel administrativo para teste e edição em fluxo real.</p>
        </div>
        <button onClick={() => void load()} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar lista'}</button>
      </div>

      <div className="tasks-toolbar card">
        <input
          placeholder="Buscar por título, descrição ou cliente"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'ALL' | TaskStatus)}>
          <option value="ALL">Todos os status</option>
          <option value="OPEN">Abertas</option>
          <option value="IN_PROGRESS">Em andamento</option>
          <option value="DONE">Concluídas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
        <div className="tasks-counter">Exibindo {visible.length} de {items.length}</div>
      </div>

      {msg ? <div className="tasks-alert">{msg}</div> : null}

      <div className="tasks-list">
        {visible.length === 0 && !loading ? <div className="card">Nenhuma tarefa encontrada.</div> : null}
        {visible.map((t) => (
          <article key={t.id} className="task-card">
            <div className="task-top">
              <input className="task-title" value={t.title} onChange={(e) => updateLocal(t.id, { title: e.target.value })} />
              <div className={`task-badge status-${t.status.toLowerCase()}`}>{statusLabel[t.status]}</div>
              <div className={`task-badge priority-${t.priority.toLowerCase()}`}>{priorityLabel[t.priority]}</div>
            </div>

            <textarea
              className="task-description"
              value={t.description || ''}
              placeholder="Descrição"
              onChange={(e) => updateLocal(t.id, { description: e.target.value })}
            />

            <div className="task-fields">
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

            <div className="task-footer">
              <small>Cliente: {t.client?.fullName || '-'} · Responsável: {t.assignedTo?.name || '-'}</small>
              <button onClick={() => void save(t)}>Salvar edição</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
