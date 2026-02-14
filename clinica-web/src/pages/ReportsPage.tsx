import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type Financial = {
  paidIncome: number;
  paidExpense: number;
  net: number;
  pendingTotal: number;
  breakdown: Array<{ type: string; status: string; _count: { _all: number }; _sum: { amount: string | number | null } }>;
};

type Appointments = {
  byStatus: Array<{ status: string; _count: { _all: number } }>;
  topServices: Array<{ serviceId: string; serviceName: string; count: number }>;
};

type Referrals = {
  total: number;
  converted: number;
  conversionRate: number;
  byStatus: Array<{ status: string; _count: { _all: number } }>;
};

type Inventory = {
  totalItems: number;
  lowStockCount: number;
  lowStock: Array<{ id: string; name: string; currentQty: number; minQty: number }>;
};

function money(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dateISO(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function statusPt(status: string) {
  const map: Record<string, string> = {
    SCHEDULED: 'Agendada',
    CONFIRMED: 'Confirmada',
    DONE: 'Concluída',
    CANCELLED: 'Cancelada',
    NEW: 'Nova',
    CONTACTED: 'Contatada',
    CONVERTED: 'Convertida',
    LOST: 'Perdida',
  };
  return map[status] || status;
}

export function ReportsPage() {
  const [from, setFrom] = useState(dateISO(30));
  const [to, setTo] = useState(dateISO(0));
  const [msg, setMsg] = useState('');

  const [financial, setFinancial] = useState<Financial | null>(null);
  const [appointments, setAppointments] = useState<Appointments | null>(null);
  const [referrals, setReferrals] = useState<Referrals | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);

  async function load() {
    setMsg('');
    try {
      const params = { from, to };
      const [f, a, r, i] = await Promise.all([
        api.get('/reports/financial', { params }),
        api.get('/reports/appointments', { params }),
        api.get('/reports/referrals', { params }),
        api.get('/reports/inventory'),
      ]);
      setFinancial(f.data);
      setAppointments(a.data);
      setReferrals(r.data);
      setInventory(i.data);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar relatórios');
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxAppointments = useMemo(() => Math.max(1, ...(appointments?.byStatus.map((x) => x._count._all) || [1])), [appointments]);
  const maxTopServices = useMemo(() => Math.max(1, ...(appointments?.topServices.map((x) => x.count) || [1])), [appointments]);

  return (
    <div className="reports-page">
      <div className="card reports-head">
        <div>
          <h2>Relatórios gerenciais</h2>
          <p>Visão executiva de financeiro, consultas, indicações e estoque.</p>
        </div>
        <div className="reports-filters">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button onClick={() => void load()}>Atualizar</button>
        </div>
      </div>

      {msg ? <div className="tasks-alert">{msg}</div> : null}

      {financial ? (
        <div className="reports-kpis">
          <div className="reports-kpi income"><span>Entradas pagas</span><strong>{money(financial.paidIncome)}</strong></div>
          <div className="reports-kpi expense"><span>Saídas pagas</span><strong>{money(financial.paidExpense)}</strong></div>
          <div className="reports-kpi net"><span>Resultado líquido</span><strong>{money(financial.net)}</strong></div>
          <div className="reports-kpi pending"><span>Pendente</span><strong>{money(financial.pendingTotal)}</strong></div>
        </div>
      ) : null}

      <div className="reports-grid">
        <section className="reports-panel">
          <h3>Consultas por status</h3>
          <div className="bar-list">
            {appointments?.byStatus?.map((s) => (
              <div key={s.status} className="bar-item">
                <div className="bar-label"><span>{statusPt(s.status)}</span><strong>{s._count._all}</strong></div>
                <div className="bar-track"><div className="bar-fill purple" style={{ width: `${(s._count._all / maxAppointments) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="reports-panel">
          <h3>Top serviços</h3>
          <div className="bar-list">
            {appointments?.topServices?.map((s) => (
              <div key={s.serviceId} className="bar-item">
                <div className="bar-label"><span>{s.serviceName}</span><strong>{s.count}</strong></div>
                <div className="bar-track"><div className="bar-fill pink" style={{ width: `${(s.count / maxTopServices) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="reports-grid">
        <section className="reports-panel">
          <h3>Indicações</h3>
          <div className="reports-row"><span>Total</span><strong>{referrals?.total || 0}</strong></div>
          <div className="reports-row"><span>Convertidas</span><strong>{referrals?.converted || 0}</strong></div>
          <div className="reports-row"><span>Taxa de conversão</span><strong>{referrals?.conversionRate || 0}%</strong></div>

          <div className="reports-subtitle" style={{ marginTop: 10 }}>Por status</div>
          {referrals?.byStatus?.map((s) => (
            <div key={s.status} className="reports-row"><span>{statusPt(s.status)}</span><strong>{s._count._all}</strong></div>
          ))}
        </section>

        <section className="reports-panel">
          <h3>Estoque crítico</h3>
          <div className="reports-row"><span>Itens totais</span><strong>{inventory?.totalItems || 0}</strong></div>
          <div className="reports-row"><span>Baixo estoque</span><strong>{inventory?.lowStockCount || 0}</strong></div>

          {inventory?.lowStock?.length ? <div className="reports-subtitle" style={{ marginTop: 10 }}>Itens críticos</div> : null}
          {inventory?.lowStock?.slice(0, 8).map((i) => (
            <div key={i.id} className="reports-row"><span>{i.name}</span><strong>{i.currentQty} / mín {i.minQty}</strong></div>
          ))}
        </section>
      </div>
    </div>
  );
}
