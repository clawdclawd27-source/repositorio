import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type PackageItem = {
  id: string;
  name: string;
  totalSessions: number;
  totalPrice: string | number;
  validityDays: number;
  active: boolean;
  service?: { name?: string };
};

export function PackagesPage() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [msg, setMsg] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', serviceId: '', totalSessions: 10, totalPrice: 0, validityDays: 180, active: true });
  const [sellForm, setSellForm] = useState({ packageId: '', clientId: '', pricePaid: 0 });
  const [clientId, setClientId] = useState('');
  const [balances, setBalances] = useState<any[]>([]);

  async function loadPackages() {
    const { data } = await api.get('/packages', { params: { page: 1, pageSize: 100 } });
    setItems(data.items || []);
  }

  useEffect(() => {
    void loadPackages();
  }, []);

  async function createPackage(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/packages', createForm);
      setMsg('Pacote criado.');
      await loadPackages();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao criar pacote');
    }
  }

  async function sellPackage(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/packages/${sellForm.packageId}/sell`, {
        clientId: sellForm.clientId,
        pricePaid: sellForm.pricePaid,
      });
      setMsg('Pacote vendido para cliente.');
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao vender pacote');
    }
  }

  async function loadBalances() {
    try {
      const { data } = await api.get(`/packages/client/${clientId}/balances`);
      setBalances(data || []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao buscar saldos');
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Pacotes de Sessões</h2>
        <button onClick={() => void loadPackages()}>Atualizar lista</button>
      </div>

      <form onSubmit={createPackage} style={{ display: 'grid', gap: 8 }}>
        <strong>Criar pacote</strong>
        <input placeholder="Nome" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} required />
        <input placeholder="Service ID" value={createForm.serviceId} onChange={(e) => setCreateForm((f) => ({ ...f, serviceId: e.target.value }))} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <input type="number" min={1} value={createForm.totalSessions} onChange={(e) => setCreateForm((f) => ({ ...f, totalSessions: Number(e.target.value) }))} />
          <input type="number" min={0} step="0.01" value={createForm.totalPrice} onChange={(e) => setCreateForm((f) => ({ ...f, totalPrice: Number(e.target.value) }))} />
          <input type="number" min={1} value={createForm.validityDays} onChange={(e) => setCreateForm((f) => ({ ...f, validityDays: Number(e.target.value) }))} />
        </div>
        <button type="submit">Criar pacote</button>
      </form>

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <strong>{p.name}</strong> ({p.service?.name || 'serviço'})
            <div>Sessões: {p.totalSessions} | Validade: {p.validityDays} dias</div>
            <div>Preço: R$ {Number(p.totalPrice).toFixed(2)} | {p.active ? 'Ativo' : 'Inativo'}</div>
            <small>ID: {p.id}</small>
          </div>
        ))}
      </div>

      <form onSubmit={sellPackage} style={{ display: 'grid', gap: 8 }}>
        <strong>Vender pacote</strong>
        <input placeholder="Package ID" value={sellForm.packageId} onChange={(e) => setSellForm((f) => ({ ...f, packageId: e.target.value }))} required />
        <input placeholder="Client ID" value={sellForm.clientId} onChange={(e) => setSellForm((f) => ({ ...f, clientId: e.target.value }))} required />
        <input type="number" min={0} step="0.01" placeholder="Preço pago" value={sellForm.pricePaid} onChange={(e) => setSellForm((f) => ({ ...f, pricePaid: Number(e.target.value) }))} />
        <button type="submit">Vender</button>
      </form>

      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Saldos por cliente</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} />
          <button onClick={() => void loadBalances()} type="button">Buscar saldos</button>
        </div>
        {balances.map((b) => (
          <div key={b.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <strong>{b.package?.name}</strong>
            <div>Status: {b.computedStatus || b.status}</div>
            <div>Sessões: {b.remainingSessions}/{b.totalSessions}</div>
          </div>
        ))}
      </div>

      {msg ? <small>{msg}</small> : null}
    </div>
  );
}
