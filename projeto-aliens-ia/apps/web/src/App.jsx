import { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:4010/api';

const statusOpt = ['NOVO', 'EM_ROTEIRO', 'PRONTO', 'PUBLICADO'];
const priorityOpt = ['A', 'M', 'B'];

const emptyNew = {
  titulo: '',
  descricao: '',
  tags: '',
  status: 'NOVO',
  prioridade: 'M',
  horaPublicacao: '',
};

export function App() {
  const [pautas, setPautas] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [newPauta, setNewPauta] = useState(emptyNew);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    if (prioridade) params.set('prioridade', prioridade);

    const r = await fetch(`${API}/pautas?${params.toString()}`);
    const d = await r.json();
    setPautas(d);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(item) {
    await fetch(`${API}/pautas/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    await load();
  }

  async function createPauta(e) {
    e.preventDefault();
    await fetch(`${API}/pautas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newPauta,
        tags: newPauta.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });
    setNewPauta(emptyNew);
    await load();
  }

  async function importCsv(mode = 'merge') {
    await fetch(`${API}/pautas/import-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    await load();
  }

  const visible = useMemo(() => pautas, [pautas]);

  return (
    <div className="wrap">
      <header>
        <h1>Aliens IA · Painel Editorial</h1>
      </header>

      <section className="toolbar">
        <input placeholder="Buscar pauta" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos status</option>
          {statusOpt.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
          <option value="">Todas prioridades</option>
          {priorityOpt.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => load()}>Filtrar</button>
        <button className="ghost" onClick={() => importCsv('merge')}>Importar CSV (merge)</button>
      </section>

      <section className="new-card">
        <h2>Nova pauta</h2>
        <form onSubmit={createPauta} className="new-form">
          <input
            placeholder="Título"
            value={newPauta.titulo}
            onChange={(e) => setNewPauta((prev) => ({ ...prev, titulo: e.target.value }))}
            required
          />
          <textarea
            rows={3}
            placeholder="Descrição"
            value={newPauta.descricao}
            onChange={(e) => setNewPauta((prev) => ({ ...prev, descricao: e.target.value }))}
          />
          <input
            placeholder="Tags (separadas por vírgula)"
            value={newPauta.tags}
            onChange={(e) => setNewPauta((prev) => ({ ...prev, tags: e.target.value }))}
          />
          <div className="row">
            <select value={newPauta.status} onChange={(e) => setNewPauta((prev) => ({ ...prev, status: e.target.value }))}>
              {statusOpt.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={newPauta.prioridade} onChange={(e) => setNewPauta((prev) => ({ ...prev, prioridade: e.target.value }))}>
              {priorityOpt.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="time" value={newPauta.horaPublicacao} onChange={(e) => setNewPauta((prev) => ({ ...prev, horaPublicacao: e.target.value }))} />
          </div>
          <button type="submit">Criar pauta</button>
        </form>
      </section>

      <section className="grid">
        {visible.map((p) => (
          <article key={p.id} className="card">
            <input value={p.titulo} onChange={(e) => setPautas((prev) => prev.map((x) => x.id === p.id ? { ...x, titulo: e.target.value } : x))} />
            <textarea rows={4} value={p.descricao || ''} onChange={(e) => setPautas((prev) => prev.map((x) => x.id === p.id ? { ...x, descricao: e.target.value } : x))} />
            <input value={(p.tags || []).join(', ')} onChange={(e) => setPautas((prev) => prev.map((x) => x.id === p.id ? { ...x, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } : x))} />
            <div className="row">
              <select value={p.status || 'NOVO'} onChange={(e) => setPautas((prev) => prev.map((x) => x.id === p.id ? { ...x, status: e.target.value } : x))}>
                {statusOpt.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={p.prioridade || 'M'} onChange={(e) => setPautas((prev) => prev.map((x) => x.id === p.id ? { ...x, prioridade: e.target.value } : x))}>
                {priorityOpt.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="time" value={p.horaPublicacao || ''} onChange={(e) => setPautas((prev) => prev.map((x) => x.id === p.id ? { ...x, horaPublicacao: e.target.value } : x))} />
            </div>
            <button onClick={() => save(p)}>Salvar</button>
          </article>
        ))}
      </section>

      {loading ? <small>Carregando...</small> : <small>{visible.length} pauta(s)</small>}
    </div>
  );
}
