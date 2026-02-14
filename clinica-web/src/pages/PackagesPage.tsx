import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type ServiceItem = { id: string; name: string };
type ClientItem = { id: string; fullName: string };

type PackageItem = {
  id: string;
  name: string;
  totalSessions: number;
  totalPrice: string | number;
  validityDays: number;
  active: boolean;
  service?: { id?: string; name?: string };
};

type BalanceItem = {
  id: string;
  status: string;
  computedStatus?: string;
  remainingSessions: number;
  totalSessions: number;
  package?: { id?: string; name?: string };
};

export function PackagesPage() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);

  const [msg, setMsg] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    serviceId: '',
    totalSessions: 10,
    totalPrice: 0,
    validityDays: 180,
    active: true,
  });
  const [sellForm, setSellForm] = useState({ packageId: '', clientId: '', pricePaid: 0 });

  const [selectedClientId, setSelectedClientId] = useState('');
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [consumptions, setConsumptions] = useState<any[]>([]);

  async function loadPackages() {
    const { data } = await api.get('/packages', { params: { page: 1, pageSize: 100 } });
    setItems(data.items || []);
  }

  async function loadServices() {
    const { data } = await api.get('/services', { params: { active: true, page: 1, pageSize: 100 } });
    setServices(Array.isArray(data) ? data : data.items || []);
  }

  async function loadClients() {
    const { data } = await api.get('/clients');
    setClients(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    void Promise.all([loadPackages(), loadServices(), loadClients()]);
  }, []);

  const selectedClientName = useMemo(
    () => clients.find((c) => c.id === selectedClientId)?.fullName || '',
    [clients, selectedClientId],
  );

  async function createPackage(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/packages', createForm);
      setMsg('Pacote criado.');
      setCreateForm({ name: '', serviceId: '', totalSessions: 10, totalPrice: 0, validityDays: 180, active: true });
      await loadPackages();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao criar pacote');
    }
  }

  async function sellPackage(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post(`/packages/${sellForm.packageId}/sell`, {
        clientId: sellForm.clientId,
        pricePaid: sellForm.pricePaid,
      });
      setMsg('Pacote vendido para cliente.');
      await loadBalancesAndConsumptions(sellForm.clientId);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao vender pacote');
    }
  }

  async function removePackage(id: string) {
    const confirmed = window.confirm('Deseja apagar este pacote? Essa ação não pode ser desfeita.');
    if (!confirmed) return;

    setMsg('');
    try {
      await api.delete(`/packages/${id}`);
      setMsg('Pacote apagado com sucesso.');
      await loadPackages();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao apagar pacote');
    }
  }

  async function loadBalancesAndConsumptions(clientId: string) {
    if (!clientId) return;
    setSelectedClientId(clientId);

    try {
      const { data: balancesData } = await api.get(`/packages/client/${clientId}/balances`);
      const balanceList = balancesData || [];
      setBalances(balanceList);

      const { data: consumptionsData } = await api.get(`/packages/client/${clientId}/consumptions`, {
        params: { page: 1, pageSize: 100 },
      });
      setConsumptions(consumptionsData.items || []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao buscar saldos/consumos');
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Pacotes de Sessões</h2>
        <button onClick={() => void Promise.all([loadPackages(), loadServices(), loadClients()])}>Atualizar dados</button>
      </div>

      <form onSubmit={createPackage} style={{ display: 'grid', gap: 8 }}>
        <strong>Criar pacote</strong>
        <input
          placeholder="Nome do pacote"
          value={createForm.name}
          onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
          required
        />

        <select
          value={createForm.serviceId}
          onChange={(e) => setCreateForm((f) => ({ ...f, serviceId: e.target.value }))}
          required
        >
          <option value="">Selecione o serviço</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <input
            type="number"
            min={1}
            value={createForm.totalSessions}
            onChange={(e) => setCreateForm((f) => ({ ...f, totalSessions: Number(e.target.value) }))}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={createForm.totalPrice}
            onChange={(e) => setCreateForm((f) => ({ ...f, totalPrice: Number(e.target.value) }))}
          />
          <input
            type="number"
            min={1}
            value={createForm.validityDays}
            onChange={(e) => setCreateForm((f) => ({ ...f, validityDays: Number(e.target.value) }))}
          />
        </div>

        <button type="submit">Criar pacote</button>
      </form>

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <strong>{p.name}</strong> ({p.service?.name || 'serviço'})
            <div>
              Sessões: {p.totalSessions} | Validade: {p.validityDays} dias
            </div>
            <div>
              Preço: R$ {Number(p.totalPrice).toFixed(2)} | {p.active ? 'Ativo' : 'Inativo'}
            </div>
            <small>ID: {p.id}</small>
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={() => void removePackage(p.id)} style={{ background: '#be123c' }}>
                Apagar pacote
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sellPackage} style={{ display: 'grid', gap: 8 }}>
        <strong>Vender pacote</strong>

        <select
          value={sellForm.packageId}
          onChange={(e) => setSellForm((f) => ({ ...f, packageId: e.target.value }))}
          required
        >
          <option value="">Selecione o pacote</option>
          {items
            .filter((p) => p.active)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>

        <select
          value={sellForm.clientId}
          onChange={(e) => setSellForm((f) => ({ ...f, clientId: e.target.value }))}
          required
        >
          <option value="">Selecione o cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Preço pago"
          value={sellForm.pricePaid}
          onChange={(e) => setSellForm((f) => ({ ...f, pricePaid: Number(e.target.value) }))}
        />

        <button type="submit">Vender</button>
      </form>

      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Saldos e consumos por cliente</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
            <option value="">Selecione o cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
          <button onClick={() => void loadBalancesAndConsumptions(selectedClientId)} type="button">
            Buscar
          </button>
        </div>

        {selectedClientName ? <small>Cliente: {selectedClientName}</small> : null}

        {balances.map((b) => (
          <div key={b.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <strong>{b.package?.name}</strong>
            <div>Status: {b.computedStatus || b.status}</div>
            <div>
              Sessões: {b.remainingSessions}/{b.totalSessions}
            </div>
          </div>
        ))}

        {consumptions.length > 0 ? <strong style={{ marginTop: 8 }}>Histórico de consumos</strong> : null}
        {consumptions.map((c) => (
          <div key={c.id} style={{ border: '1px solid #f3d4fa', borderRadius: 10, padding: 10 }}>
            <div>
              <strong>{c.clientPackage?.package?.name}</strong> · {new Date(c.consumedAt).toLocaleString('pt-BR')}
            </div>
            <div>Atendimento: {c.appointmentId}</div>
            <div>Serviço: {c.appointment?.service?.name || '-'}</div>
            <div>Profissional: {c.appointment?.professional?.name || '-'}</div>
          </div>
        ))}
      </div>

      {msg ? <small>{msg}</small> : null}
    </div>
  );
}
