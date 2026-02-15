import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

const initialForm = {
  name: '',
  description: '',
  durationMinutes: 60,
  basePrice: 0,
  active: true,
  installmentEnabled: false,
  installmentMax: 5,
  installmentValue: 0,
};

function money(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const INSTALLMENT_TAG = '[PARCELAMENTO]';

function parseInstallment(description?: string) {
  if (!description) return { text: '', enabled: false, max: 5, value: 0 };
  const re = /\[PARCELAMENTO\]\s*até\s*(\d+)x\s*de\s*R\$\s*([\d.,]+)/i;
  const m = description.match(re);
  const text = description.replace(re, '').replace(/\n{2,}/g, '\n').trim();
  if (!m) return { text, enabled: false, max: 5, value: 0 };
  const parsedValue = Number(m[2].replace(/\./g, '').replace(',', '.'));
  return {
    text,
    enabled: true,
    max: Number(m[1]) || 5,
    value: Number.isFinite(parsedValue) ? parsedValue : 0,
  };
}

function buildDescription(text: string, enabled: boolean, max: number, value: number) {
  const cleanText = (text || '').replace(/\[PARCELAMENTO\][^\n]*/gi, '').trim();
  if (!enabled) return cleanText;
  const tag = `${INSTALLMENT_TAG} até ${max}x de ${money(value)}`;
  return cleanText ? `${cleanText}\n${tag}` : tag;
}

export function ServicesPage() {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  const [items, setItems] = useState<Service[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  async function load() {
    if (isClient) {
      const { data } = await api.get<Service[]>('/portal/services');
      setItems((data || []).filter((s) => s.active));
      return;
    }

    const { data } = await api.get<ListResponse | Service[]>('/services', { params: { page: 1, pageSize: 100 } });
    const rows = Array.isArray(data) ? data : data.items || [];
    setItems(rows);
  }

  useEffect(() => {
    void load();
  }, [isClient]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (isClient) return;
    setMsg('');
    try {
      const payload = {
        name: form.name,
        description: buildDescription(form.description, form.installmentEnabled, form.installmentMax, form.installmentValue),
        durationMinutes: form.durationMinutes,
        basePrice: form.basePrice,
        active: form.active,
      };

      if (editingId) {
        await api.patch(`/services/${editingId}`, payload);
        setMsg('Serviço atualizado.');
      } else {
        await api.post('/services', payload);
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
    if (isClient) return;
    setEditingId(s.id);
    const parsed = parseInstallment(s.description);
    setForm({
      name: s.name,
      description: parsed.text,
      durationMinutes: s.durationMinutes,
      basePrice: Number(s.basePrice),
      active: s.active,
      installmentEnabled: parsed.enabled,
      installmentMax: parsed.max,
      installmentValue: parsed.value,
    });
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{isClient ? 'Serviços disponíveis' : 'Serviços'}</h2>
        <button type="button" onClick={() => void load()}>Atualizar lista</button>
      </div>

      {!isClient ? (
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

          <div style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10, display: 'grid', gap: 8 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={form.installmentEnabled}
                onChange={(e) => setForm((f) => ({ ...f, installmentEnabled: e.target.checked }))}
              />
              Habilitar parcelamento
            </label>

            {form.installmentEnabled ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="number"
                  min={1}
                  max={24}
                  placeholder="Máximo de parcelas"
                  value={form.installmentMax}
                  onChange={(e) => setForm((f) => ({ ...f, installmentMax: Number(e.target.value) }))}
                  required
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Valor da parcela"
                  value={form.installmentValue}
                  onChange={(e) => setForm((f) => ({ ...f, installmentValue: Number(e.target.value) }))}
                  required
                />
              </div>
            ) : null}
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
      ) : (
        <small>Você visualiza somente serviços ativos.</small>
      )}

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((s) => {
          const installment = parseInstallment(s.description);
          return (
            <div key={s.id} style={{ border: '1px solid #f0abfc', borderRadius: 12, padding: 12, display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{s.name}</strong>
                <span>{s.active ? '✅ Ativo' : '⛔ Inativo'}</span>
              </div>

              <div style={{ color: '#6b5a7a', fontSize: 13 }}>Duração: {s.durationMinutes} min</div>

              <div style={{ fontWeight: 700, color: '#7c3aed' }}>
                {installment.text || `Preço base: ${money(s.basePrice)}`}
              </div>

              {installment.enabled ? (
                <div style={{ border: '1px dashed #d946ef', borderRadius: 8, padding: 8, fontSize: 13, color: '#6b21a8' }}>
                  Parcelamento: até {installment.max}x de {money(installment.value)}
                </div>
              ) : null}

              <div style={{ color: '#7b6c89', fontSize: 13 }}>Valor total: {money(s.basePrice)}</div>

              {!isClient ? (
                <button type="button" onClick={() => startEdit(s)} style={{ marginTop: 6, justifySelf: 'start' }}>Editar</button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
