import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type Service = {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  basePrice: string | number;
  active: boolean;
};

type ListResponse = { items: Service[]; total: number };

const initialForm = { name: '', description: '', durationMinutes: 60, basePrice: 0, active: true };

export function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await api.get<ListResponse>('/services', { params: { page: 1, pageSize: 100 } });
    setItems(data.items || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      if (editingId) {
        await api.patch(`/services/${editingId}`, form);
        setMsg('Serviço atualizado.');
      } else {
        await api.post('/services', form);
        setMsg('Serviço criado.');
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar serviço');
    }
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description || '',
      durationMinutes: s.durationMinutes,
      basePrice: Number(s.basePrice),
      active: s.active,
    });
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0 }}>Serviços</h2>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Nome" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        <input placeholder="Descrição" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            type="number"
            min={1}
            placeholder="Duração (min)"
            value={form.durationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
            required
          />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Preço base"
            value={form.basePrice}
            onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
            required
          />
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
          Ativo
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Salvar edição' : 'Criar serviço'}</button>
          {editingId ? (
            <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((s) => (
          <div key={s.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <strong>{s.name}</strong> {s.active ? '✅' : '⛔'}
            <div>Duração: {s.durationMinutes} min</div>
            <div>Preço: R$ {Number(s.basePrice).toFixed(2)}</div>
            <button type="button" onClick={() => startEdit(s)} style={{ marginTop: 8 }}>Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
