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
    <div className="portal-page card">
      <div className="portal-head">
        <div>
          <h2>Portal do Cliente</h2>
          <p>Clínica Emanuelle Ferreira · seus atendimentos, indicações e acompanhamento.</p>
        </div>
        <button onClick={() => void load()}>Atualizar</button>
      </div>

      {msg ? <small>{msg}</small> : null}

      {me ? (
        <div className="portal-me">
          <strong>{me.fullName}</strong>
          <div>E-mail: {me.email || '-'}</div>
          <div>Telefone: {me.phone || '-'}</div>
        </div>
      ) : null}

      <div className="portal-grid">
        <section className="portal-panel">
          <strong>Minhas consultas</strong>
          {appointments.length === 0 ? <div>Nenhuma consulta encontrada.</div> : null}
          {appointments.map((a) => (
            <div key={a.id} className="portal-item">
              <div><strong>{a.service?.name || '-'}</strong></div>
              <div>{new Date(a.startsAt).toLocaleString('pt-BR')} - {new Date(a.endsAt).toLocaleTimeString('pt-BR')}</div>
              <div>Status: {a.status}</div>
            </div>
          ))}
        </section>

        <section className="portal-panel">
          <strong>Minhas indicações</strong>
          {referrals.length === 0 ? <div>Nenhuma indicação encontrada.</div> : null}
          {referrals.map((r) => (
            <div key={r.id} className="portal-item">
              <div><strong>{r.referredName}</strong></div>
              <div>Status: {r.status}</div>
              <div>Criada em: {new Date(r.createdAt).toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
