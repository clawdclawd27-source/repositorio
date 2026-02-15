import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type Me = { id: string; fullName: string; email?: string; phone?: string };
type Appointment = { id: string; startsAt: string; endsAt: string; status: string; service?: { name?: string } };
type Referral = { id: string; referredName: string; status: string; createdAt: string };

function formatAppointmentStatus(status: string) {
  const key = (status || '').toUpperCase();
  if (key === 'SCHEDULED') return 'Agendada';
  if (key === 'CONFIRMED') return 'Confirmada';
  if (key === 'COMPLETED') return 'Concluída';
  if (key === 'CANCELLED') return 'Cancelada';
  if (key === 'NO_SHOW') return 'Não compareceu';
  return status || '-';
}

function formatReferralStatus(status: string) {
  const key = (status || '').toUpperCase();
  if (key === 'NEW') return 'Nova';
  if (key === 'CONTACTED') return 'Contatada';
  if (key === 'CONVERTED') return 'Convertida';
  if (key === 'LOST') return 'Não convertida';
  return status || '-';
}

export function PortalClientPage() {
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [msg, setMsg] = useState('');

  const orderedAppointments = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [appointments],
  );

  const nextAppointment = useMemo(() => {
    const now = Date.now();
    return orderedAppointments.find((a) => new Date(a.startsAt).getTime() >= now) || null;
  }, [orderedAppointments]);

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
      setMsg('Portal atualizado.');
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

      {msg ? <div style={{ fontSize: 13, color: '#6b5a7a' }}>{msg}</div> : null}

      <div className="portal-clinic-banner">
        <div>
          <strong>Clínica Emanuelle Ferreira</strong>
          <div>Rua Marte, 2294 · Sítio Cercado · Curitiba</div>
          <div>WhatsApp: (41) 99875-6850</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="portal-whats-btn" onClick={() => navigate('/configuracoes')}>
            Alterar senha
          </button>
          <a className="portal-whats-btn" href="https://wa.me/5541998756850" target="_blank" rel="noreferrer">
            Agendar pelo WhatsApp
          </a>
        </div>
      </div>

      {me ? (
        <div className="portal-me">
          <strong>{me.fullName}</strong>
          <div>E-mail: {me.email || '-'}</div>
          <div>Telefone: {me.phone || '-'}</div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
        <div className="portal-item"><strong>Consultas</strong><div>{orderedAppointments.length}</div></div>
        <div className="portal-item"><strong>Indicações</strong><div>{referrals.length}</div></div>
        <div className="portal-item">
          <strong>Próxima consulta</strong>
          <div>
            {nextAppointment
              ? new Date(nextAppointment.startsAt).toLocaleString('pt-BR')
              : 'Nenhuma futura'}
          </div>
        </div>
      </div>

      <div className="portal-grid">
        <section className="portal-panel">
          <strong>Minhas consultas</strong>
          {orderedAppointments.length === 0 ? <div>Nenhuma consulta encontrada.</div> : null}
          {orderedAppointments.map((a) => (
            <div key={a.id} className="portal-item">
              <div><strong>{a.service?.name || 'Atendimento'}</strong></div>
              <div>{new Date(a.startsAt).toLocaleString('pt-BR')} - {new Date(a.endsAt).toLocaleTimeString('pt-BR')}</div>
              <div>Status: {formatAppointmentStatus(a.status)}</div>
            </div>
          ))}
        </section>

        <section className="portal-panel">
          <strong>Minhas indicações</strong>
          {referrals.length === 0 ? <div>Nenhuma indicação encontrada.</div> : null}
          {referrals.map((r) => (
            <div key={r.id} className="portal-item">
              <div><strong>{r.referredName}</strong></div>
              <div>Status: {formatReferralStatus(r.status)}</div>
              <div>Criada em: {new Date(r.createdAt).toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
