import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  client?: { fullName?: string };
  service?: { name?: string };
  professional?: { name?: string };
};

type CalendarResponse = {
  total: number;
  grouped: Record<string, Appointment[]>;
};

type Client = { id: string; fullName: string };
type Service = { id: string; name: string; durationMinutes: number };

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function AppointmentsPage() {
  const [date, setDate] = useState(todayISODate());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [data, setData] = useState<CalendarResponse>({ total: 0, grouped: {} });

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [form, setForm] = useState({
    clientId: '',
    serviceId: '',
    startsAt: '',
    professionalId: '',
    notes: '',
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CalendarResponse>('/appointments/calendar-view', {
        params: { date, mode: 'day', slotMinutes: 30 },
      });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar agenda');
    } finally {
      setLoading(false);
    }
  }

  async function loadRefs() {
    try {
      const [c, s] = await Promise.all([
        api.get<Client[]>('/clients'),
        api.get<{ items: Service[] } | Service[]>('/services', { params: { active: true, page: 1, pageSize: 100 } }),
      ]);
      setClients(c.data || []);
      setServices(Array.isArray(s.data) ? s.data : s.data.items || []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar clientes/serviços');
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    void loadRefs();
  }, []);

  const appointments = useMemo(() => Object.values(data.grouped).flat(), [data.grouped]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/appointments/check-and-create', {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        useServiceDuration: true,
      });
      setMsg('Consulta criada com sucesso.');
      setForm({ clientId: '', serviceId: '', startsAt: '', professionalId: '', notes: '' });
      await load();
    } catch (err: any) {
      const conflictMsg = err?.response?.data?.message;
      if (typeof conflictMsg === 'string') setMsg(conflictMsg);
      else if (Array.isArray(conflictMsg)) setMsg(conflictMsg.join(', '));
      else setMsg('Erro ao criar consulta');
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0 }}>Consultas</h2>
          <small style={{ color: '#7a2e65' }}>Agenda do dia · Total: {data.total}</small>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={() => void load()} disabled={loading}>
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
          <button type="button" onClick={() => void loadRefs()}>Atualizar clientes/serviços</button>
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <strong>Nova consulta</strong>
        <small style={{ color: '#7a2e65' }}>Clientes: {clients.length} · Serviços: {services.length}</small>

        <select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} required>
          <option value="">Selecione cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}
            </option>
          ))}
        </select>

        <select value={form.serviceId} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))} required>
          <option value="">Selecione serviço</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.durationMinutes} min)
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={form.startsAt}
          onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
          required
        />
        <input
          placeholder="ID profissional (opcional)"
          value={form.professionalId}
          onChange={(e) => setForm((f) => ({ ...f, professionalId: e.target.value }))}
        />
        <input
          placeholder="Observações"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <button type="submit">Criar consulta</button>
      </form>

      {error ? <small>{error}</small> : null}
      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {appointments.length === 0 && !loading ? <div>Nenhuma consulta neste dia.</div> : null}
        {appointments.map((a) => (
          <div key={a.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <strong>
              {new Date(a.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(a.endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </strong>
            <div>Cliente: {a.client?.fullName || '-'}</div>
            <div>Serviço: {a.service?.name || '-'}</div>
            <div>Profissional: {a.professional?.name || '-'}</div>
            <div>Status: {a.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
