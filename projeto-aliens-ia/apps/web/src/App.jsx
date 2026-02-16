import { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:4010/api';

const statusOpt = ['NOVO', 'EM_ROTEIRO', 'PRONTO', 'PUBLICADO'];
const priorityOpt = ['A', 'M', 'B'];

export function App() {
  const [pautas, setPautas] = useState([]);
  const [q, setQ] = useState('');

  async function load() {
    const r = await fetch(`${API}/pautas`);
    const d = await r.json();
    setPautas(d);
  }

  useEffect(() => { void load(); }, []);

  async function save(item) {
    await fetch(`${API}/pautas/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    await load();
  }

  const visible = useMemo(() => {
    return pautas.filter((p) => `${p.titulo} ${p.descricao}`.toLowerCase().includes(q.toLowerCase()));
  }, [pautas, q]);

  return (
    <div className="wrap">
      <header>
        <h1>Aliens IA · Painel Editorial</h1>
        <input placeholder="Buscar pauta" value={q} onChange={(e) => setQ(e.target.value)} />
      </header>

      <section className="grid">
        {visible.map((p) => (
          <article key={p.id} className="card">
            <input value={p.titulo} onChange={(e) => setPautas((prev) => prev.map((x) => x.id === p.id ? { ...x, titulo: e.target.value } : x))} />
            <textarea rows={4} value={p.descricao || ''} onChange={(e) => setPautas((prev) => prev.map((x) => x.id === p.id ? { ...x, descricao: e.target.value } : x))} />
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
    </div>
  );
}
