import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type Client = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
};

type Appointment = {
  id: string;
  startsAt: string;
  status: string;
  service?: { name?: string };
};

type ClientPackage = {
  id: string;
  remainingSessions: number;
  totalSessions: number;
  computedStatus?: string;
  status?: string;
  package?: { name?: string };
};

const initialForm = { fullName: '', phone: '', email: '', cpf: '', birthDate: '' };

export function ClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [form, setForm] = useState(initialForm);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([]);
  const [historyPackages, setHistoryPackages] = useState<ClientPackage[]>([]);

  async function load() {
    const { data } = await api.get<Client[]>('/clients');
    setItems(data || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      const payload = {
        ...form,
        birthDate: form.birthDate || undefined,
      };

      if (editingId) {
        await api.patch(`/clients/${editingId}`, payload);
        setMsg('Cliente atualizado.');
      } else {
        await api.post('/clients', payload);
        setMsg('Cliente criado.');
      }

      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar cliente');
    }
  }

  function startEdit(c: Client) {
    setEditingId(c.id);
    setForm({
      fullName: c.fullName || '',
      phone: c.phone || '',
      email: c.email || '',
      cpf: c.cpf || '',
      birthDate: c.birthDate ? new Date(c.birthDate).toISOString().slice(0, 10) : '',
    });
  }

  async function removeClient(id: string) {
    const ok = window.confirm('Deseja apagar este cliente?');
    if (!ok) return;

    setMsg('');
    try {
      await api.delete(`/clients/${id}`);
      setMsg('Cliente apagado.');
      if (openHistoryId === id) {
        setOpenHistoryId(null);
        setHistoryAppointments([]);
        setHistoryPackages([]);
      }
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao apagar cliente');
    }
  }

  async function openHistory(clientId: string) {
    if (openHistoryId === clientId) {
      setOpenHistoryId(null);
      setHistoryAppointments([]);
      setHistoryPackages([]);
      return;
    }

    setOpenHistoryId(clientId);
    setMsg('');

    try {
      const [ap, pk] = await Promise.all([
        api.get('/appointments', { params: { clientId, page: 1, pageSize: 20 } }),
        api.get(`/packages/client/${clientId}/balances`),
      ]);

      setHistoryAppointments(ap.data?.items || []);
      setHistoryPackages(pk.data || []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar histórico do cliente');
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Clientes</h2>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input
          placeholder="Nome completo"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            placeholder="Telefone / WhatsApp"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
          />
          <input
            placeholder="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            placeholder="CPF"
            value={form.cpf}
            onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
            required
          />
          <input
            type="date"
            placeholder="Data de nascimento"
            value={form.birthDate}
            onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Salvar edição' : 'Criar cliente'}</button>
          {editingId ? (
            <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((c) => (
          <div key={c.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10, display: 'grid', gap: 8 }}>
            <div>
              <strong>{c.fullName}</strong>
              <div>Telefone/WhatsApp: {c.phone || '-'}</div>
              <div>E-mail: {c.email || '-'}</div>
              <div>CPF: {c.cpf || '-'}</div>
              <div>
                Data de nascimento: {c.birthDate ? new Date(c.birthDate).toLocaleDateString('pt-BR') : '-'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => startEdit(c)}>Editar informações</button>
              <button type="button" onClick={() => void openHistory(c.id)}>Histórico e pacotes</button>
              <button type="button" onClick={() => void removeClient(c.id)} style={{ background: '#be123c' }}>Apagar cliente</button>
            </div>

            {openHistoryId === c.id ? (
              <div style={{ borderTop: '1px dashed #e9d5ff', paddingTop: 8, display: 'grid', gap: 8 }}>
                <strong>Histórico do cliente</strong>

                <div>
                  <small>Consultas recentes</small>
                  {historyAppointments.length === 0 ? <div>Nenhuma consulta encontrada.</div> : null}
                  {historyAppointments.map((a) => (
                    <div key={a.id} style={{ border: '1px solid #f3d4fa', borderRadius: 8, padding: 8, marginTop: 6 }}>
                      <div>{new Date(a.startsAt).toLocaleString('pt-BR')} · {a.service?.name || '-'} </div>
                      <div>Status: {a.status}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <small>Pacotes comprados</small>
                  {historyPackages.length === 0 ? <div>Nenhum pacote comprado.</div> : null}
                  {historyPackages.map((p) => (
                    <div key={p.id} style={{ border: '1px solid #f3d4fa', borderRadius: 8, padding: 8, marginTop: 6 }}>
                      <div>{p.package?.name || '-'}</div>
                      <div>Status: {p.computedStatus || p.status}</div>
                      <div>Sessões: {p.remainingSessions}/{p.totalSessions}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
