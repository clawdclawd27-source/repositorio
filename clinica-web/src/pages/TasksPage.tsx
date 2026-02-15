import { FormEvent, useEffect, useMemo, useState } from 'react';
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
  LOW: 'B',
  MEDIUM: 'M',
  HIGH: 'A',
};

const initialCreate = {
  title: '',
  description: '',
  priority: 'MEDIUM' as TaskPriority,
  dueDate: '',
};

function toLocalInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function TasksPage() {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | TaskStatus>('ALL');

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreate);

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

  async function createTask(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: createForm.title,
        description: createForm.description || undefined,
        priority: createForm.priority,
        dueDate: createForm.dueDate ? new Date(createForm.dueDate).toISOString() : undefined,
      });
      setCreateForm(initialCreate);
      setShowCreate(false);
      setMsg('Tarefa criada com sucesso.');
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao criar tarefa');
    }
  }

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

  async function markResolved(task: Task) {
    try {
      await api.patch(`/tasks/${task.id}`, { status: 'DONE' });
      setMsg(`Tarefa "${task.title}" marcada como concluída.`);
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao concluir tarefa');
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
          <p>Painel administrativo com criação, prioridade e conclusão rápida.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setShowCreate((v) => !v)}>{showCreate ? 'Fechar criação' : 'Nova tarefa'}</button>
          <button onClick={() => void load()} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar lista'}</button>
        </div>
      </div>

      {showCreate ? (
        <form className="card" onSubmit={createTask} style={{ display: 'grid', gap: 8 }}>
          <strong>Criação de tarefa</strong>
          <input placeholder="Nome da tarefa" value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} required />
          <textarea placeholder="Descrição" value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input type="datetime-local" value={createForm.dueDate} onChange={(e) => setCreateForm((f) => ({ ...f, dueDate: e.target.value }))} />
            <select value={createForm.priority} onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}>
              <option value="HIGH">Prioridade Alta</option>
              <option value="MEDIUM">Prioridade Média</option>
              <option value="LOW">Prioridade Baixa</option>
            </select>
          </div>
          <button type="submit">Criar tarefa</button>
        </form>
      ) : null}

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
                type="datetime-local"
                value={toLocalInput(t.dueDate)}
                onChange={(e) => updateLocal(t.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>

            <div className="task-footer">
              <small>Cliente: {t.client?.fullName || '-'} · Responsável: {t.assignedTo?.name || '-'} </small>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => void markResolved(t)} type="button">Resolvido</button>
                <button onClick={() => void save(t)} type="button">Salvar edição</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
