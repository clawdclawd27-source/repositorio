import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type Client = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  birthDate?: string;
};

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function BirthdaysPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
  const [showHistory, setShowHistory] = useState(false);

  async function load() {
    setLoading(true);
    setMsg('');
    try {
      const { data } = await api.get<Client[]>('/clients');
      setClients((data || []).filter((c) => !!c.birthDate));
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar aniversários');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const mapped = useMemo(() => {
    return clients
      .map((c) => {
        const d = new Date(c.birthDate as string);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return { ...c, month, day };
      })
      .sort((a, b) => (a.month - b.month) || (a.day - b.day) || a.fullName.localeCompare(b.fullName));
  }, [clients]);

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  const todayRows = mapped.filter((c) => c.day === todayDay && c.month === todayMonth);
  const historyRows = mapped.filter((c) => c.month === monthFilter);

  return (
    <div className="birthdays-page">
      <div className="card birthdays-head">
        <div>
          <h2>Aniversários de clientes</h2>
          <p>Exibindo por padrão somente os aniversariantes de hoje.</p>
        </div>
        <button onClick={() => void load()} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar lista'}</button>
      </div>

      {msg ? <div className="tasks-alert">{msg}</div> : null}

      <div className="birthdays-list">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🎉 Aniversariantes do dia</h3>
          {todayRows.length === 0 ? (
            <div>Nenhum cliente faz aniversário hoje.</div>
          ) : (
            todayRows.map((c) => (
              <article key={c.id} className="birthday-card" style={{ marginBottom: 8 }}>
                <div>
                  <strong>{c.fullName}</strong>
                  <div className="birthday-date">{String(c.day).padStart(2, '0')} de {months[c.month - 1]}</div>
                </div>
                <div>
                  <div>Telefone: {c.phone || '-'}</div>
                  <div>E-mail: {c.email || '-'}</div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="card birthdays-toolbar">
          <button type="button" onClick={() => setShowHistory((v) => !v)}>
            {showHistory ? 'Ocultar histórico mensal' : 'Ver histórico mensal'}
          </button>

          {showHistory ? (
            <>
              <select value={monthFilter} onChange={(e) => setMonthFilter(Number(e.target.value))}>
                {months.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <div className="birthdays-counter">Total no mês: {historyRows.length}</div>
            </>
          ) : (
            <div className="birthdays-counter">Histórico oculto</div>
          )}
        </div>

        {showHistory ? (
          <div>
            {historyRows.length === 0 && !loading ? <div className="card">Nenhum cliente com aniversário neste mês.</div> : null}
            {historyRows.map((c) => (
              <article key={`hist-${c.id}`} className="birthday-card">
                <div>
                  <strong>{c.fullName}</strong>
                  <div className="birthday-date">{String(c.day).padStart(2, '0')} de {months[c.month - 1]}</div>
                </div>
                <div>
                  <div>Telefone: {c.phone || '-'}</div>
                  <div>E-mail: {c.email || '-'}</div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
