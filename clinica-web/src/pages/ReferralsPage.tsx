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

const contactTimeLabel: Record<'MANHA_10' | 'TARDE_13' | 'NOITE_21', string> = {
  MANHA_10: 'Manhã (a partir das 10h)',
  TARDE_13: 'Tarde (a partir das 13h)',
  NOITE_21: 'Noite (até 21h)',
};

export function ReferralsPage() {
  const [items, setItems] = useState<Referral[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ referredName: '', referredPhone: '', contactTime: '' as '' | 'MANHA_10' | 'TARDE_13' | 'NOITE_21' });
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

      if (!matched?.id) {
        setMsg('Informe o nome do indicador exatamente como está no cadastro de clientes.');
        return;
      }

      await api.post('/referrals', {
        referrerClientId: matched.id,
        referredName: form.referredName,
        referredPhone: form.referredPhone || undefined,
        notes: form.contactTime ? `Horário disponível para contato: ${contactTimeLabel[form.contactTime]}` : undefined,
      });
      setMsg('Indicação criada.');
      setReferrerNameInput('');
      setForm({ referredName: '', referredPhone: '', contactTime: '' });
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
          required
        />
        <input placeholder="Nome do indicado" value={form.referredName} onChange={(e) => setForm((f) => ({ ...f, referredName: e.target.value }))} required />
        <input placeholder="Telefone" value={form.referredPhone} onChange={(e) => setForm((f) => ({ ...f, referredPhone: e.target.value }))} />
        <select value={form.contactTime} onChange={(e) => setForm((f) => ({ ...f, contactTime: e.target.value as 'MANHA_10' | 'TARDE_13' | 'NOITE_21' }))} required>
          <option value="">Selecione horário para contato</option>
          <option value="MANHA_10">Manhã (a partir das 10h)</option>
          <option value="TARDE_13">Tarde (a partir das 13h)</option>
          <option value="NOITE_21">Noite (até 21h)</option>
        </select>
        <button type="submit">Criar indicação</button>
      </form>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((r) => (
          <div key={r.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10, display: 'grid', gap: 6 }}>
            <div><strong>{r.referredName}</strong> · Indicador: {r.referrerClient?.fullName || '-'}</div>
            <div>Contato: {r.referredPhone || '-'}</div>
            <div>Horário disponível: {r.notes?.replace('Horário disponível para contato: ', '') || '-'}</div>
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
