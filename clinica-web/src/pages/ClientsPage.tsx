import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type Client = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  accountUser?: { id: string; email?: string; role?: 'CLIENT' | 'ADMIN' | 'OWNER'; isActive?: boolean };
};

type Appointment = {
  id: string;
  startsAt: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'DONE' | 'CANCELLED';
  notes?: string;
  service?: { name?: string };
};

type ClientPackage = {
  id: string;
  remainingSessions: number;
  totalSessions: number;
  computedStatus?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  status?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  package?: { name?: string };
};

type AccessRole = 'CLIENT' | 'OWNER' | 'FUNCIONARIO' | 'ADMIN';

function dateOnlyToInput(value?: string) {
  if (!value) return '';
  const only = value.includes('T') ? value.slice(0, 10) : value;
  return only;
}

function dateOnlyToPtBr(value?: string) {
  if (!value) return '-';
  const only = value.includes('T') ? value.slice(0, 10) : value;
  const [y, m, d] = only.split('-');
  if (!y || !m || !d) return '-';
  return `${d}/${m}/${y}`;
}

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  cpf: '',
  birthDate: '',
  accessRole: 'CLIENT' as AccessRole,
  loginEmail: '',
  loginPassword: '',
};

export function ClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [form, setForm] = useState(initialForm);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([]);
  const [historyPackages, setHistoryPackages] = useState<ClientPackage[]>([]);

  const [apptDraft, setApptDraft] = useState<Record<string, { startsAt: string; status: Appointment['status']; notes: string }>>({});
  const [pkgDraft, setPkgDraft] = useState<Record<string, { remainingSessions: number; status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' }>>({});
  const [roleDraft, setRoleDraft] = useState<Record<string, 'CLIENT' | 'OWNER' | 'ADMIN'>>({});

  async function load() {
    const { data } = await api.get<Client[]>('/clients');
    setItems(data || []);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const next: Record<string, 'CLIENT' | 'OWNER' | 'ADMIN'> = {};
    items.forEach((c) => {
      next[c.id] = (c.accountUser?.role as 'CLIENT' | 'OWNER' | 'ADMIN') || 'CLIENT';
    });
    setRoleDraft(next);
  }, [items]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      const payload: any = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        cpf: form.cpf,
        birthDate: form.birthDate || undefined,
      };

      if (!editingId && form.accessRole === 'CLIENT') {
        if (!form.loginEmail || !form.loginPassword) {
          setMsg('Para CLIENTE, preencha login e senha.');
          return;
        }
        payload.accountRole = 'CLIENT';
        payload.loginEmail = form.loginEmail;
        payload.loginPassword = form.loginPassword;
      }

      if (!editingId && form.accessRole !== 'CLIENT' && form.loginEmail && form.loginPassword) {
        payload.accountRole = form.accessRole === 'FUNCIONARIO' ? 'ADMIN' : form.accessRole;
        payload.loginEmail = form.loginEmail;
        payload.loginPassword = form.loginPassword;
      }
      if (editingId) {
        await api.patch(`/clients/${editingId}`, payload);
        setMsg('Cliente atualizado.');
      } else {
        await api.post('/clients', payload);
        setMsg('Cliente criado.');
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar cliente');
    }
  }

  function startEdit(c: Client) {
    setEditingId(c.id);
    setForm({
      fullName: c.fullName || '',
      phone: c.phone || '',
      email: c.email || '',
      cpf: c.cpf || '',
      birthDate: dateOnlyToInput(c.birthDate),
      accessRole: 'CLIENT',
      loginEmail: '',
      loginPassword: '',
    });
  }

  async function removeClient(id: string) {
    if (!window.confirm('Deseja apagar este cliente?')) return;
    setMsg('');
    try {
      await api.delete(`/clients/${id}`);
      setMsg('Cliente apagado.');
      if (openHistoryId === id) {
        setOpenHistoryId(null);
        setHistoryAppointments([]);
        setHistoryPackages([]);
      }
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao apagar cliente');
    }
  }

  async function saveAccessRole(clientId: string) {
    try {
      const role = roleDraft[clientId];
      await api.patch(`/clients/${clientId}/access-role`, { role });
      setMsg('Perfil de acesso atualizado com sucesso.');
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao atualizar perfil de acesso');
    }
  }

  async function openHistory(clientId: string) {
    if (openHistoryId === clientId) {
      setOpenHistoryId(null);
      setHistoryAppointments([]);
      setHistoryPackages([]);
      return;
    }

    setOpenHistoryId(clientId);
    setMsg('');
    try {
      const [ap, pk] = await Promise.all([
        api.get('/appointments', { params: { clientId, page: 1, pageSize: 20 } }),
        api.get(`/packages/client/${clientId}/balances`),
      ]);

      const aRows: Appointment[] = ap.data?.items || [];
      const pRows: ClientPackage[] = pk.data || [];
      setHistoryAppointments(aRows);
      setHistoryPackages(pRows);

      const aDraft: Record<string, { startsAt: string; status: Appointment['status']; notes: string }> = {};
      aRows.forEach((a) => {
        const d = new Date(a.startsAt);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        aDraft[a.id] = { startsAt: d.toISOString().slice(0, 16), status: a.status, notes: a.notes || '' };
      });
      setApptDraft(aDraft);

      const pDraft: Record<string, { remainingSessions: number; status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' }> = {};
      pRows.forEach((p) => {
        pDraft[p.id] = {
          remainingSessions: p.remainingSessions,
          status: (p.computedStatus || p.status || 'ACTIVE') as 'ACTIVE' | 'COMPLETED' | 'EXPIRED',
        };
      });
      setPkgDraft(pDraft);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar histórico do cliente');
    }
  }

  async function saveAppointment(a: Appointment) {
    const d = apptDraft[a.id];
    if (!d) return;

    try {
      await api.patch(`/appointments/${a.id}/reschedule`, { startsAt: new Date(d.startsAt).toISOString(), useServiceDuration: true, notes: d.notes });
      await api.patch(`/appointments/${a.id}/status`, { status: d.status, notes: d.notes });
      setMsg('Histórico de consulta atualizado e salvo.');
      if (openHistoryId) await openHistory(openHistoryId);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao editar consulta');
    }
  }

  async function removeAppointment(id: string) {
    if (!window.confirm('Apagar esta consulta?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setMsg('Consulta apagada.');
      if (openHistoryId) await openHistory(openHistoryId);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao apagar consulta');
    }
  }

  async function saveClientPackage(p: ClientPackage) {
    const d = pkgDraft[p.id];
    if (!d) return;
    try {
      await api.patch(`/packages/client-package/${p.id}`, {
        remainingSessions: d.remainingSessions,
        status: d.status,
      });
      setMsg('Pacote comprado atualizado.');
      if (openHistoryId) await openHistory(openHistoryId);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao editar pacote comprado');
    }
  }

  async function removeClientPackage(id: string) {
    if (!window.confirm('Apagar este pacote comprado?')) return;
    try {
      await api.delete(`/packages/client-package/${id}`);
      setMsg('Pacote comprado apagado.');
      if (openHistoryId) await openHistory(openHistoryId);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao apagar pacote comprado');
    }
  }

  return (
    <div className="card clients-page" style={{ display: 'grid', gap: 12 }}>
      <div>
        <h2 style={{ margin: 0 }}>Clientes</h2>
        <small style={{ color: '#7a2e65' }}>Cadastro, histórico completo, pacotes e ações rápidas</small>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Nome completo" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="Telefone / WhatsApp" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
          <input placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))} required />
          <input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} required />
        </div>

        {!editingId ? (
          <div style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 10, padding: 10 }}>
            <strong>Acesso ao sistema</strong>
            <select value={form.accessRole} onChange={(e) => setForm((f) => ({ ...f, accessRole: e.target.value as AccessRole }))}>
              <option value="CLIENT">Cliente</option>
              <option value="OWNER">Owner</option>
              <option value="FUNCIONARIO">Funcionário</option>
              <option value="ADMIN">Admin</option>
            </select>

            {form.accessRole === 'CLIENT' ? (
              <>
                <input type="email" placeholder="Login (e-mail do cliente)" value={form.loginEmail} onChange={(e) => setForm((f) => ({ ...f, loginEmail: e.target.value }))} required />
                <input type="password" placeholder="Senha do cliente" value={form.loginPassword} onChange={(e) => setForm((f) => ({ ...f, loginPassword: e.target.value }))} required />
              </>
            ) : (
              <small style={{ color: '#7b6c89' }}>Para {form.accessRole}, login/senha são opcionais aqui.</small>
            )}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Salvar edição' : 'Criar cliente'}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancelar</button> : null}
        </div>
      </form>

      {msg ? <small>{msg}</small> : null}

      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((c) => (
          <div key={c.id} className="client-card" style={{ border: '1px solid #f0abfc', borderRadius: 10, padding: 10, display: 'grid', gap: 8 }}>
            <div>
              <strong>{c.fullName}</strong>
              <div>Telefone/WhatsApp: {c.phone || '-'}</div>
              <div>E-mail: {c.email || '-'}</div>
              <div>CPF: {c.cpf || '-'}</div>
              <div>Data de nascimento: {dateOnlyToPtBr(c.birthDate)}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
              <select value={roleDraft[c.id] || 'CLIENT'} onChange={(e) => setRoleDraft((prev) => ({ ...prev, [c.id]: e.target.value as 'CLIENT' | 'OWNER' | 'ADMIN' }))}>
                <option value="CLIENT">Cliente</option>
                <option value="ADMIN">Funcionário</option>
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button type="button" onClick={() => void saveAccessRole(c.id)}>Salvar perfil</button>
            </div>

            <div className="client-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => startEdit(c)}>Editar informações</button>
              <button type="button" onClick={() => void openHistory(c.id)}>Histórico de consultas</button>
              <button type="button" onClick={() => void removeClient(c.id)} style={{ background: '#be123c' }}>Apagar cliente</button>
            </div>

            {openHistoryId === c.id ? (
              <div className="client-history" style={{ borderTop: '1px dashed #e9d5ff', paddingTop: 8, display: 'grid', gap: 8 }}>
                <strong>Histórico de consultas do paciente</strong>

                <div>
                  <small>Consultas recentes</small>
                  {historyAppointments.length === 0 ? <div>Nenhuma consulta encontrada.</div> : null}
                  {historyAppointments.map((a) => (
                    <div key={a.id} style={{ border: '1px solid #f3d4fa', borderRadius: 8, padding: 8, marginTop: 6, display: 'grid', gap: 6 }}>
                      <div><strong>{a.service?.name || '-'}</strong> · {new Date(a.startsAt).toLocaleString('pt-BR')}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <input
                          type="datetime-local"
                          value={apptDraft[a.id]?.startsAt || ''}
                          onChange={(e) => setApptDraft((prev) => ({ ...prev, [a.id]: { ...(prev[a.id] || { status: a.status, notes: a.notes || '' }), startsAt: e.target.value } }))}
                        />
                        <select
                          value={apptDraft[a.id]?.status || a.status}
                          onChange={(e) => setApptDraft((prev) => ({ ...prev, [a.id]: { ...(prev[a.id] || { startsAt: '', notes: a.notes || '' }), status: e.target.value as Appointment['status'] } }))}
                        >
                          <option value="SCHEDULED">Agendada</option>
                          <option value="CONFIRMED">Confirmada</option>
                          <option value="DONE">Concluída</option>
                          <option value="CANCELLED">Cancelada</option>
                        </select>
                      </div>

                      <textarea
                        placeholder="Observações da consulta"
                        value={apptDraft[a.id]?.notes || ''}
                        onChange={(e) => setApptDraft((prev) => ({ ...prev, [a.id]: { ...(prev[a.id] || { startsAt: '', status: a.status }), notes: e.target.value } }))}
                        rows={2}
                      />

                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => void saveAppointment(a)}>Salvar</button>
                        <button type="button" onClick={() => void removeAppointment(a.id)} style={{ background: '#be123c' }}>Apagar</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <small>Pacotes comprados</small>
                  {historyPackages.length === 0 ? <div>Nenhum pacote comprado.</div> : null}
                  {historyPackages.map((p) => (
                    <div key={p.id} style={{ border: '1px solid #f3d4fa', borderRadius: 8, padding: 8, marginTop: 6, display: 'grid', gap: 6 }}>
                      <div><strong>{p.package?.name || '-'}</strong> · Sessões: {p.remainingSessions}/{p.totalSessions}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 6 }}>
                        <input
                          type="number"
                          min={0}
                          value={pkgDraft[p.id]?.remainingSessions ?? p.remainingSessions}
                          onChange={(e) => setPkgDraft((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || { status: (p.computedStatus || p.status || 'ACTIVE') as any }), remainingSessions: Number(e.target.value) } }))}
                        />
                        <select
                          value={pkgDraft[p.id]?.status || p.computedStatus || p.status || 'ACTIVE'}
                          onChange={(e) => setPkgDraft((prev) => ({ ...prev, [p.id]: { ...(prev[p.id] || { remainingSessions: p.remainingSessions }), status: e.target.value as 'ACTIVE' | 'COMPLETED' | 'EXPIRED' } }))}
                        >
                          <option value="ACTIVE">Ativo</option>
                          <option value="COMPLETED">Concluído</option>
                          <option value="EXPIRED">Expirado</option>
                        </select>
                        <button type="button" onClick={() => void saveClientPackage(p)}>Editar</button>
                        <button type="button" onClick={() => void removeClientPackage(p.id)} style={{ background: '#be123c' }}>Apagar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
