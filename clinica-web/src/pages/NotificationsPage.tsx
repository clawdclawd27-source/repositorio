import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type LogItem = {
  id: string;
  kind: string;
  phone: string;
  status: string;
  error?: string;
  createdAt: string;
};

export function NotificationsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ phone: '', message: 'Olá! Aqui é a Clínica Emanuelle Ferreira 💜 Mensagem de teste.' });

  async function load() {
    try {
      const { data } = await api.get('/notifications/logs');
      setLogs(data || []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar logs');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function sendTest(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/notifications/test-whatsapp', form);
      setMsg('Mensagem teste enviada.');
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao enviar teste');
    }
  }

  async function runNow(kind: 'appointments' | 'birthdays') {
    setMsg('');
    try {
      await api.post(`/notifications/run-${kind}`);
      setMsg(`Disparo ${kind === 'appointments' ? 'de consultas' : 'de aniversários'} executado.`);
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao executar disparo');
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Notificações</h2>

      <form onSubmit={sendTest} style={{ display: 'grid', gap: 8 }}>
        <strong>Teste de WhatsApp</strong>
        <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
        <input placeholder="Mensagem" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required />
        <button type="submit">Enviar teste</button>
      </form>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => void runNow('appointments')}>Rodar lembretes de consultas agora</button>
        <button type="button" onClick={() => void runNow('birthdays')}>Rodar aniversários agora</button>
        <button type="button" onClick={() => void load()}>Atualizar logs</button>
      </div>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {logs.map((l) => (
          <div key={l.id} style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <div><strong>{l.kind}</strong> · {l.status}</div>
            <div>Telefone: {l.phone}</div>
            <div>Data: {new Date(l.createdAt).toLocaleString('pt-BR')}</div>
            {l.error ? <div>Erro: {l.error}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
