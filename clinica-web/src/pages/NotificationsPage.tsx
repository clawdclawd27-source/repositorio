import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type LogItem = {
  id: string;
  kind: string;
  phone: string;
  status: string;
  error?: string;
  createdAt: string;
};

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

function friendlyNotificationError(raw?: string) {
  if (!raw) return '';
  const lower = raw.toLowerCase();

  if (raw.includes('#131030') || lower.includes('not in allowed list')) {
    return 'Número não autorizado na lista de teste da Meta. Adicione o destinatário em Configuração da API > campo “Até”.';
  }

  if (raw.includes('(#10)') || lower.includes('does not have permission for this action')) {
    return 'Token sem permissão para envio. Gere um novo token na Meta com acesso ao WhatsApp (whatsapp_business_messaging).';
  }

  if (lower.includes('whatsapp_token/whatsapp_phone_number_id não configurados')) {
    return 'Configuração antiga sem token/phone id. Atualize os logs para ver os envios mais recentes.';
  }

  return raw;
}

export function NotificationsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ phone: '', message: 'Olá! Aqui é a Clínica Emanuelle Ferreira 💜 Mensagem de teste.' });

  const phonePreview = useMemo(() => normalizePhone(form.phone), [form.phone]);

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
      await api.post('/notifications/test-whatsapp', {
        ...form,
        phone: normalizePhone(form.phone),
      });
      setMsg('Mensagem teste enviada.');
      await load();
    } catch (err: any) {
      setMsg(friendlyNotificationError(err?.response?.data?.message || 'Erro ao enviar teste'));
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
        <input placeholder="Telefone (ex.: 5541999999999)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
        <small>Formato recomendado: DDI + DDD + número (somente dígitos). Exemplo: 5541999999999.</small>
        {phonePreview ? <small>Prévia enviada: {phonePreview}</small> : null}
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
            {l.error ? <div>Erro: {friendlyNotificationError(l.error)}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
