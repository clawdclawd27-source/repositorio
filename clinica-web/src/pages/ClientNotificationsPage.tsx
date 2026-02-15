import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type Me = { fullName?: string };
type Appointment = {
  id: string;
  startsAt: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'DONE' | 'CANCELLED';
  service?: { name?: string };
};

function statusPt(status: Appointment['status']) {
  if (status === 'SCHEDULED') return 'Agendada';
  if (status === 'CONFIRMED') return 'Confirmada';
  if (status === 'DONE') return 'Concluída';
  return 'Cancelada';
}

export function ClientNotificationsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    setMsg('');
    try {
      const [m, a] = await Promise.all([
        api.get('/portal/me'),
        api.get('/portal/appointments', { params: { page: 1, pageSize: 30 } }),
      ]);
      setMe(m.data || null);
      setAppointments(a.data?.items || []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar notificações do cliente');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const alerts = useMemo(() => {
    const now = Date.now();
    const rows = [...appointments].sort((x, y) => new Date(x.startsAt).getTime() - new Date(y.startsAt).getTime());

    return rows.map((a) => {
      const when = new Date(a.startsAt);
      const diffMin = Math.round((when.getTime() - now) / 60000);

      let level = 'info';
      let alert = `Consulta ${statusPt(a.status)}.`;

      if (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') {
        if (diffMin <= 120 && diffMin >= 0) {
          level = 'warning';
          alert = '⚠️ Alerta: sua consulta está próxima.';
        } else if (diffMin < 0) {
          level = 'muted';
          alert = 'Consulta já passou. Verifique atualização de status.';
        } else {
          alert = 'Lembrete de agendamento confirmado no sistema.';
        }
      }

      return {
        id: a.id,
        clientName: me?.fullName || 'Cliente',
        serviceName: a.service?.name || 'Atendimento',
        when: when.toLocaleString('pt-BR'),
        status: statusPt(a.status),
        alert,
        level,
      };
    });
  }, [appointments, me?.fullName]);

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Notificações do Cliente</h2>
          <small style={{ color: '#7a2e65' }}>Alertas de agendamento e lembretes de consulta</small>
        </div>
        <button onClick={() => void load()}>Atualizar</button>
      </div>

      {msg ? <small>{msg}</small> : null}

      {alerts.length === 0 ? <div>Nenhuma notificação no momento.</div> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {alerts.map((n) => (
          <div key={n.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10, display: 'grid', gap: 4 }}>
            <strong>{n.clientName}</strong>
            <div>Consulta: {n.serviceName}</div>
            <div>Data/Hora: {n.when}</div>
            <div>Status: {n.status}</div>
            <div style={{ color: n.level === 'warning' ? '#be123c' : '#6b5a7a', fontWeight: n.level === 'warning' ? 700 : 500 }}>
              {n.alert}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
