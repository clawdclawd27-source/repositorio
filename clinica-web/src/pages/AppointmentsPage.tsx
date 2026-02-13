import { useEffect, useMemo, useState } from 'react';
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

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function AppointmentsPage() {
  const [date, setDate] = useState(todayISODate());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CalendarResponse>({ total: 0, grouped: {} });

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

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const appointments = useMemo(() => Object.values(data.grouped).flat(), [data.grouped]);

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0 }}>Agenda do dia</h2>
          <small style={{ color: '#7a2e65' }}>Total: {data.total}</small>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={() => void load()} disabled={loading}>
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {error ? <small>{error}</small> : null}

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
