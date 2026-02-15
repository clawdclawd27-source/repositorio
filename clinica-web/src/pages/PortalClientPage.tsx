import { useEffect, useState } from 'react';
import { api } from '../services/api';

type Me = { id: string; fullName: string; email?: string; phone?: string };
type Appointment = { id: string; startsAt: string; endsAt: string; status: string; service?: { name?: string } };
type Referral = { id: string; referredName: string; status: string; createdAt: string };

export function PortalClientPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    setMsg('');
    try {
      const [m, a, r] = await Promise.all([
        api.get('/portal/me'),
        api.get('/portal/appointments', { params: { page: 1, pageSize: 20 } }),
        api.get('/portal/referrals', { params: { page: 1, pageSize: 20 } }),
      ]);
      setMe(m.data || null);
      setAppointments(a.data?.items || []);
      setReferrals(r.data?.items || []);
    } catch (err: any) {
      const code = err?.response?.status;
      if (code === 403) setMsg('Acesso do portal disponível apenas com usuário CLIENT.');
      else setMsg(err?.response?.data?.message || 'Erro ao carregar portal do cliente');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Portal do Cliente</h2>
        <button onClick={() => void load()}>Atualizar</button>
      </div>

      {msg ? <small>{msg}</small> : null}

      {me ? (
        <div style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
          <strong>{me.fullName}</strong>
          <div>E-mail: {me.email || '-'}</div>
          <div>Telefone: {me.phone || '-'}</div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Minhas consultas</strong>
        {appointments.length === 0 ? <div>Nenhuma consulta encontrada.</div> : null}
        {appointments.map((a) => (
          <div key={a.id} style={{ border: '1px solid #f3d4fa', borderRadius: 10, padding: 10 }}>
            <div><strong>{a.service?.name || '-'}</strong></div>
            <div>{new Date(a.startsAt).toLocaleString('pt-BR')} - {new Date(a.endsAt).toLocaleTimeString('pt-BR')}</div>
            <div>Status: {a.status}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Minhas indicações</strong>
        {referrals.length === 0 ? <div>Nenhuma indicação encontrada.</div> : null}
        {referrals.map((r) => (
          <div key={r.id} style={{ border: '1px solid #f3d4fa', borderRadius: 10, padding: 10 }}>
            <div><strong>{r.referredName}</strong></div>
            <div>Status: {r.status}</div>
            <div>Criada em: {new Date(r.createdAt).toLocaleString('pt-BR')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
