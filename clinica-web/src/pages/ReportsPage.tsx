import { useEffect, useState } from 'react';
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

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Relatórios</h2>
          <small style={{ color: '#7a2e65' }}>Financeiro, consultas, indicações e estoque</small>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button onClick={() => void load()}>Atualizar</button>
        </div>
      </div>

      {msg ? <small>{msg}</small> : null}

      {financial ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <div className="card"><strong>{money(financial.paidIncome)}</strong><div>Entradas pagas</div></div>
          <div className="card"><strong>{money(financial.paidExpense)}</strong><div>Saídas pagas</div></div>
          <div className="card"><strong>{money(financial.net)}</strong><div>Resultado líquido</div></div>
          <div className="card"><strong>{money(financial.pendingTotal)}</strong><div>Pendente</div></div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
          <strong>Consultas por status</strong>
          {appointments?.byStatus?.map((s) => (
            <div key={s.status}>{s.status}: {s._count._all}</div>
          ))}

          <strong style={{ display: 'block', marginTop: 8 }}>Top serviços</strong>
          {appointments?.topServices?.map((s) => (
            <div key={s.serviceId}>{s.serviceName}: {s.count}</div>
          ))}
        </div>

        <div style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
          <strong>Indicações</strong>
          <div>Total: {referrals?.total || 0}</div>
          <div>Convertidas: {referrals?.converted || 0}</div>
          <div>Taxa de conversão: {referrals?.conversionRate || 0}%</div>

          <strong style={{ display: 'block', marginTop: 8 }}>Por status</strong>
          {referrals?.byStatus?.map((s) => (
            <div key={s.status}>{s.status}: {s._count._all}</div>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
        <strong>Estoque</strong>
        <div>Itens totais: {inventory?.totalItems || 0}</div>
        <div>Baixo estoque: {inventory?.lowStockCount || 0}</div>
        {inventory?.lowStock?.length ? <strong style={{ display: 'block', marginTop: 8 }}>Itens críticos</strong> : null}
        {inventory?.lowStock?.slice(0, 10).map((i) => (
          <div key={i.id}>{i.name}: {i.currentQty} / mín {i.minQty}</div>
        ))}
      </div>
    </div>
  );
}
