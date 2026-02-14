import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type Client = { id: string; fullName: string };
type Referral = {
  id: string;
  referrerClientId: string;
  referrerClient?: { fullName?: string };
  referredName: string;
  referredPhone?: string;
  referredEmail?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'LOST';
  notes?: string;
  createdAt: string;
};

const statusLabel: Record<Referral['status'], string> = {
  NEW: 'Nova',
  CONTACTED: 'Contatada',
  CONVERTED: 'Convertida',
  LOST: 'Perdida',
};

export function ReferralsPage() {
  const [items, setItems] = useState<Referral[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ referrerClientId: '', referredName: '', referredPhone: '', referredEmail: '', notes: '' });
  const [referrerNameInput, setReferrerNameInput] = useState('');
  const [statusDraft, setStatusDraft] = useState<Record<string, Referral['status']>>({});

  async function load() {
    try {
      const [r, c] = await Promise.all([
        api.get('/referrals', { params: { page: 1, pageSize: 100 } }),
        api.get('/clients'),
      ]);
      const rows = r.data?.items || [];
      setItems(rows);
      setClients(c.data || []);
      const s: Record<string, Referral['status']> = {};
      rows.forEach((x: Referral) => (s[x.id] = x.status));
      setStatusDraft(s);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar indicações');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      const typed = referrerNameInput.trim();
      const matched = typed
        ? clients.find((c) => c.fullName.toLowerCase() === typed.toLowerCase())
        : undefined;

      const referrerClientId = form.referrerClientId || matched?.id;
      if (!referrerClientId) {
        setMsg('Informe o nome do indicador (cliente já cadastrado) ou selecione na lista.');
        return;
      }

      await api.post('/referrals', {
        ...form,
        referrerClientId,
        referredPhone: form.referredPhone || undefined,
        referredEmail: form.referredEmail || undefined,
        notes: form.notes || undefined,
      });
      setMsg('Indicação criada.');
      setReferrerNameInput('');
      setForm({ referrerClientId: '', referredName: '', referredPhone: '', referredEmail: '', notes: '' });
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao criar indicação');
    }
  }

  async function saveStatus(id: string) {
    setMsg('');
    try {
      await api.patch(`/referrals/${id}/status`, { status: statusDraft[id] });
      setMsg('Status da indicação atualizado.');
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao atualizar status');
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Indicações</h2>

      <form onSubmit={create} style={{ display: 'grid', gap: 8 }}>
        <strong>Nova indicação</strong>
        <input
          placeholder="Nome de quem indicou"
          value={referrerNameInput}
          onChange={(e) => setReferrerNameInput(e.target.value)}
        />
        <select value={form.referrerClientId} onChange={(e) => setForm((f) => ({ ...f, referrerClientId: e.target.value }))}>
          <option value="">Ou selecione o cliente indicador</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>
        <input placeholder="Nome do indicado" value={form.referredName} onChange={(e) => setForm((f) => ({ ...f, referredName: e.target.value }))} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="Telefone" value={form.referredPhone} onChange={(e) => setForm((f) => ({ ...f, referredPhone: e.target.value }))} />
          <input placeholder="E-mail" type="email" value={form.referredEmail} onChange={(e) => setForm((f) => ({ ...f, referredEmail: e.target.value }))} />
        </div>
        <input placeholder="Observações" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        <button type="submit">Criar indicação</button>
      </form>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((r) => (
          <div key={r.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10, display: 'grid', gap: 6 }}>
            <div><strong>{r.referredName}</strong> · Indicador: {r.referrerClient?.fullName || '-'}</div>
            <div>Contato: {r.referredPhone || '-'} | {r.referredEmail || '-'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <select value={statusDraft[r.id] || r.status} onChange={(e) => setStatusDraft((prev) => ({ ...prev, [r.id]: e.target.value as Referral['status'] }))}>
                {Object.keys(statusLabel).map((s) => <option key={s} value={s}>{statusLabel[s as Referral['status']]}</option>)}
              </select>
              <button type="button" onClick={() => void saveStatus(r.id)}>Salvar status</button>
            </div>
            <small>Criada em: {new Date(r.createdAt).toLocaleString('pt-BR')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
