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
  const [monthFilter, setMonthFilter] = useState<'ALL' | number>('ALL');

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

  const rows = useMemo(() => {
    const mapped = clients
      .filter((c) => !!c.birthDate)
      .map((c) => {
        const d = new Date(c.birthDate as string);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return { ...c, month, day, date: d };
      });

    const filtered = monthFilter === 'ALL' ? mapped : mapped.filter((r) => r.month === monthFilter);
    return filtered.sort((a, b) => (a.month - b.month) || (a.day - b.day) || a.fullName.localeCompare(b.fullName));
  }, [clients, monthFilter]);

  return (
    <div className="birthdays-page">
      <div className="card birthdays-head">
        <div>
          <h2>Aniversários de clientes</h2>
          <p>Lista completa para testes (dados reais do cadastro de clientes).</p>
        </div>
        <button onClick={() => void load()} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar lista'}</button>
      </div>

      <div className="card birthdays-toolbar">
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}>
          <option value="ALL">Todos os meses</option>
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <div className="birthdays-counter">Total exibido: {rows.length}</div>
      </div>

      {msg ? <div className="tasks-alert">{msg}</div> : null}

      <div className="birthdays-list">
        {rows.length === 0 && !loading ? <div className="card">Nenhum cliente com aniversário neste filtro.</div> : null}
        {rows.map((c) => (
          <article key={c.id} className="birthday-card">
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
    </div>
  );
}
