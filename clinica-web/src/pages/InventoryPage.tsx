import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type InventoryItem = {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  unit: string;
  currentQty: string | number;
  minQty: string | number;
  costPrice?: string | number;
  salePrice?: string | number;
  active: boolean;
};

type StockMovement = {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: string | number;
  reason?: string;
  createdAt: string;
  item?: { name?: string; unit?: string };
  createdBy?: { name?: string; email?: string };
};

type Summary = {
  totals: {
    activeItems: number;
    lowStockItems: number;
    stockValueCost: number;
    stockValueSale: number;
  };
  topConsumed: Array<{ itemId: string; itemName: string; quantityOut: number }>;
};

const emptyItem = {
  name: '', sku: '', category: '', unit: 'un', currentQty: 0, minQty: 0, costPrice: 0, salePrice: 0, active: true,
};

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movementForm, setMovementForm] = useState({ itemId: '', type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT', quantity: 1, reason: '' });

  async function loadAll() {
    const [i, m, s] = await Promise.all([
      api.get('/inventory/items'),
      api.get('/inventory/movements'),
      api.get('/inventory/summary'),
    ]);
    setItems(i.data || []);
    setMovements(m.data || []);
    setSummary(s.data || null);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const lowStockIds = useMemo(() => {
    return new Set(items.filter((i) => Number(i.currentQty) <= Number(i.minQty)).map((i) => i.id));
  }, [items]);

  async function submitItem(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      if (editingId) {
        await api.patch(`/inventory/items/${editingId}`, form);
        setMsg('Item atualizado.');
      } else {
        await api.post('/inventory/items', form);
        setMsg('Item criado.');
      }
      setForm(emptyItem);
      setEditingId(null);
      await loadAll();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar item');
    }
  }

  function editItem(i: InventoryItem) {
    setEditingId(i.id);
    setForm({
      name: i.name,
      sku: i.sku || '',
      category: i.category || '',
      unit: i.unit || 'un',
      currentQty: Number(i.currentQty),
      minQty: Number(i.minQty),
      costPrice: Number(i.costPrice || 0),
      salePrice: Number(i.salePrice || 0),
      active: i.active,
    });
  }

  async function submitMovement(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/inventory/movements', movementForm);
      setMsg('Movimentação registrada.');
      setMovementForm({ itemId: movementForm.itemId, type: 'IN', quantity: 1, reason: '' });
      await loadAll();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao registrar movimentação');
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Estoque</h2>
          <small style={{ color: '#7a2e65' }}>Gestão profissional de itens, alertas e movimentações</small>
        </div>
        <button onClick={() => void loadAll()}>Atualizar dados</button>
      </div>

      {summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <div className="card"><strong>{summary.totals.activeItems}</strong><div>Itens ativos</div></div>
          <div className="card"><strong>{summary.totals.lowStockItems}</strong><div>Baixo estoque</div></div>
          <div className="card"><strong>R$ {summary.totals.stockValueCost.toFixed(2)}</strong><div>Valor em custo</div></div>
          <div className="card"><strong>R$ {summary.totals.stockValueSale.toFixed(2)}</strong><div>Valor em venda</div></div>
        </div>
      ) : null}

      <form onSubmit={submitItem} style={{ display: 'grid', gap: 8 }}>
        <strong>{editingId ? 'Editar item' : 'Novo item'}</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.6fr', gap: 8 }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <small>Nome do item</small>
            <input placeholder="Ex.: Botox 100U" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <small>SKU (código interno)</small>
            <input placeholder="Ex.: BTX-100U" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <small>Categoria</small>
            <input placeholder="Ex.: Injetáveis" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <small>Unidade</small>
            <input placeholder="un, ml, fr" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <small>Quantidade atual</small>
            <input type="number" step="0.001" min={0} placeholder="0" value={form.currentQty} onChange={(e) => setForm((f) => ({ ...f, currentQty: Number(e.target.value) }))} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <small>Quantidade mínima</small>
            <input type="number" step="0.001" min={0} placeholder="0" value={form.minQty} onChange={(e) => setForm((f) => ({ ...f, minQty: Number(e.target.value) }))} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <small>Preço de custo (R$)</small>
            <input type="number" step="0.01" min={0} placeholder="0,00" value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: Number(e.target.value) }))} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <small>Preço de venda (R$)</small>
            <input type="number" step="0.01" min={0} placeholder="0,00" value={form.salePrice} onChange={(e) => setForm((f) => ({ ...f, salePrice: Number(e.target.value) }))} />
          </label>
        </div>
        <small style={{ color: '#7b6c89' }}>SKU = código único interno do produto para facilitar busca, controle e conferência no estoque.</small>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Salvar item' : 'Criar item'}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(emptyItem); }}>Cancelar</button> : null}
        </div>
      </form>

      <form onSubmit={submitMovement} style={{ display: 'grid', gap: 8 }}>
        <strong>Movimentação</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 0.8fr 1.2fr auto', gap: 8 }}>
          <select value={movementForm.itemId} onChange={(e) => setMovementForm((f) => ({ ...f, itemId: e.target.value }))} required>
            <option value="">Selecione o item</option>
            {items.filter(i => i.active).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <select value={movementForm.type} onChange={(e) => setMovementForm((f) => ({ ...f, type: e.target.value as any }))}>
            <option value="IN">Entrada</option>
            <option value="OUT">Saída</option>
            <option value="ADJUSTMENT">Ajuste</option>
          </select>
          <input type="number" step="0.001" placeholder={movementForm.type === 'ADJUSTMENT' ? 'Qtd (+/-)' : 'Qtd'} value={movementForm.quantity} onChange={(e) => setMovementForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
          <input placeholder="Motivo" value={movementForm.reason} onChange={(e) => setMovementForm((f) => ({ ...f, reason: e.target.value }))} />
          <button type="submit">Lançar</button>
        </div>
      </form>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Itens</strong>
        {items.map((i) => (
          <div key={i.id} style={{ border: lowStockIds.has(i.id) ? '1px solid #f43f5e' : '1px solid #f0abfc', borderRadius: 10, padding: 10, display: 'grid', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{i.name}</strong>
              <span>{lowStockIds.has(i.id) ? '⚠️ Baixo estoque' : '✅ OK'}</span>
            </div>
            <div>SKU: {i.sku || '-'} · Categoria: {i.category || '-'} · Unidade: {i.unit}</div>
            <div>Qtd atual: {Number(i.currentQty)} · Mínimo: {Number(i.minQty)}</div>
            <div>Custo: R$ {Number(i.costPrice || 0).toFixed(2)} · Venda: R$ {Number(i.salePrice || 0).toFixed(2)}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => editItem(i)}>Editar</button>
              <button type="button" onClick={() => setMovementForm((f) => ({ ...f, itemId: i.id, type: 'IN', quantity: 1 }))}>Entrada</button>
              <button type="button" onClick={() => setMovementForm((f) => ({ ...f, itemId: i.id, type: 'OUT', quantity: 1 }))}>Saída</button>
              <button type="button" onClick={() => setMovementForm((f) => ({ ...f, itemId: i.id, type: 'ADJUSTMENT', quantity: 0 }))}>Ajuste</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <strong>Movimentações recentes</strong>
        {movements.slice(0, 20).map((m) => (
          <div key={m.id} style={{ border: '1px solid #f3d4fa', borderRadius: 10, padding: 10 }}>
            <div><strong>{m.item?.name || '-'}</strong> · {m.type} · {Number(m.quantity)} {m.item?.unit || ''}</div>
            <div>{new Date(m.createdAt).toLocaleString('pt-BR')} · {m.createdBy?.name || m.createdBy?.email || '-'}</div>
            <div>Motivo: {m.reason || '-'}</div>
          </div>
        ))}
      </div>

      {summary?.topConsumed?.length ? (
        <div style={{ display: 'grid', gap: 6 }}>
          <strong>Mais consumidos (saídas)</strong>
          {summary.topConsumed.map((t) => (
            <div key={t.itemId}>{t.itemName}: {t.quantityOut}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
