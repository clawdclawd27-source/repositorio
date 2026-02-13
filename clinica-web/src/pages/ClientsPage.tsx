import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type Client = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  cpf?: string;
};

const initialForm = { fullName: '', phone: '', email: '', cpf: '' };

export function ClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [form, setForm] = useState(initialForm);
  const [msg, setMsg] = useState('');

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
      await api.post('/clients', form);
      setForm(initialForm);
      setMsg('Cliente criado.');
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao criar cliente');
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Clientes</h2>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Nome completo" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <input placeholder="E-mail" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))} />
        <button type="submit">Criar cliente</button>
      </form>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((c) => (
          <div key={c.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <strong>{c.fullName}</strong>
            <div>Telefone: {c.phone || '-'}</div>
            <div>E-mail: {c.email || '-'}</div>
            <small>ID: {c.id}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
