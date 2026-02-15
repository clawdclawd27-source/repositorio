import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

type ClinicProfile = {
  clinicName: string;
  cnpj: string;
  address: string;
  whatsapp: string;
  email: string;
  logoUrl: string;
};

type Agenda = {
  workStartHour: number;
  workEndHour: number;
  slotMinutes: number;
  bufferMinutes: number;
};

type PermissionItem = {
  id?: string;
  role?: string;
  resource: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

type ClientProfile = {
  fullName: string;
  phone: string;
};

type ProfessionalItem = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'OWNER' | 'CLIENT';
  createdAt?: string;
};

type RoleOption = 'CLIENT' | 'OWNER' | 'FUNCIONARIO' | 'ADMIN';

const defaultProfile: ClinicProfile = {
  clinicName: '', cnpj: '', address: '', whatsapp: '', email: '', logoUrl: '',
};

const defaultAgenda: Agenda = {
  workStartHour: 8, workEndHour: 18, slotMinutes: 30, bufferMinutes: 10,
};

const defaultClient: ClientProfile = {
  fullName: '', phone: '',
};

export function SettingsPage() {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  const [profile, setProfile] = useState<ClinicProfile>(defaultProfile);
  const [agenda, setAgenda] = useState<Agenda>(defaultAgenda);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);

  const [clientProfile, setClientProfile] = useState<ClientProfile>(defaultClient);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [newProfessional, setNewProfessional] = useState({ name: '', email: '', phone: '', password: '', role: 'ADMIN' as RoleOption });
  const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);

  const [msg, setMsg] = useState('');

  async function load() {
    setMsg('');
    try {
      if (isClient) {
        const me = await api.get('/portal/me');
        setClientProfile({
          fullName: me.data?.fullName || '',
          phone: me.data?.phone || '',
        });
        setNewEmail(user?.email || '');
        return;
      }

      const [p, a, perms, pros] = await Promise.all([
        api.get('/settings/clinic-profile'),
        api.get('/settings/agenda'),
        api.get('/permissions').catch(() => ({ data: [] })),
        api.get('/settings/professionals').catch(() => ({ data: [] })),
      ]);
      setProfile({ ...defaultProfile, ...(p.data || {}) });
      setAgenda({ ...defaultAgenda, ...(a.data || {}) });
      setPermissions(Array.isArray(perms.data) ? perms.data : []);
      setProfessionals(Array.isArray(pros.data) ? pros.data : []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar configurações');
    }
  }

  useEffect(() => {
    void load();
  }, [isClient]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    try {
      await api.put('/settings/clinic-profile', profile);
      setMsg('Perfil da clínica atualizado.');
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar perfil da clínica');
    }
  }

  async function saveAgenda(e: FormEvent) {
    e.preventDefault();
    try {
      await api.put('/settings/agenda', agenda);
      setMsg('Configurações da agenda atualizadas.');
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar agenda');
    }
  }

  async function saveClientProfile(e: FormEvent) {
    e.preventDefault();
    try {
      await api.patch('/portal/me', clientProfile);
      setMsg('Perfil do cliente atualizado.');
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar perfil do cliente');
    }
  }

  async function changeEmail(e: FormEvent) {
    e.preventDefault();
    try {
      await api.patch('/portal/account/email', { email: newEmail });
      setMsg('E-mail alterado com sucesso. Faça novo login para atualizar a sessão.');
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao mudar e-mail');
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    try {
      await api.patch('/portal/account/password', { password: newPassword });
      setNewPassword('');
      setMsg('Senha alterada com sucesso.');
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao mudar senha');
    }
  }

  async function changeAdminPassword(e: FormEvent) {
    e.preventDefault();
    try {
      await api.patch('/settings/account/password', { password: adminNewPassword });
      setAdminNewPassword('');
      setMsg('Senha da conta administrativa alterada com sucesso.');
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao mudar senha do administrador');
    }
  }

  async function saveProfessional(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingProfessionalId) {
        const payload: any = {
          name: newProfessional.name,
          email: newProfessional.email,
          phone: newProfessional.phone,
          role: newProfessional.role === 'FUNCIONARIO' ? 'ADMIN' : newProfessional.role,
        };
        if (newProfessional.password?.trim()) payload.password = newProfessional.password;
        await api.patch(`/settings/professionals/${editingProfessionalId}`, payload);
        setMsg('Profissional atualizado com sucesso.');
      } else {
        await api.post('/settings/professionals', {
          ...newProfessional,
          role: newProfessional.role === 'FUNCIONARIO' ? 'ADMIN' : newProfessional.role,
        });
        setMsg('Profissional cadastrado com sucesso.');
      }

      setNewProfessional({ name: '', email: '', phone: '', password: '', role: 'ADMIN' });
      setEditingProfessionalId(null);
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao salvar profissional');
    }
  }

  function startEditProfessional(pro: ProfessionalItem) {
    setEditingProfessionalId(pro.id);
    setNewProfessional({
      name: pro.name || '',
      email: pro.email || '',
      phone: pro.phone || '',
      password: '',
      role: (pro.role || 'ADMIN') as RoleOption,
    });
  }

  async function deleteProfessional(pro: ProfessionalItem) {
    if (!window.confirm(`Deseja excluir ${pro.name}?`)) return;
    try {
      await api.delete(`/settings/professionals/${pro.id}`);
      if (editingProfessionalId === pro.id) {
        setEditingProfessionalId(null);
        setNewProfessional({ name: '', email: '', phone: '', password: '', role: 'ADMIN' });
      }
      setMsg('Profissional excluído com sucesso.');
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao excluir profissional');
    }
  }

  if (isClient) {
    return (
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>Configurações</h2>
            <small style={{ color: '#7a2e65' }}>Perfil do cliente e segurança da conta</small>
          </div>
          <button onClick={() => void load()}>Atualizar</button>
        </div>

        {msg ? <small>{msg}</small> : null}

        <form onSubmit={saveClientProfile} style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 12, padding: 12 }}>
          <strong>Perfil do cliente</strong>
          <input placeholder="Nome" value={clientProfile.fullName} onChange={(e) => setClientProfile((v) => ({ ...v, fullName: e.target.value }))} />
          <input placeholder="Telefone / WhatsApp" value={clientProfile.phone} onChange={(e) => setClientProfile((v) => ({ ...v, phone: e.target.value }))} />
          <button type="submit">Salvar perfil</button>
        </form>

        <form onSubmit={changeEmail} style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 12, padding: 12 }}>
          <strong>Mudar e-mail</strong>
          <input type="email" placeholder="Novo e-mail" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <button type="submit">Salvar novo e-mail</button>
        </form>

        <form onSubmit={changePassword} style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 12, padding: 12 }}>
          <strong>Mudar senha</strong>
          <input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <button type="submit">Salvar nova senha</button>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Configurações</h2>
          <small style={{ color: '#7a2e65' }}>Perfil da clínica, usuários/permissões e agenda</small>
        </div>
        <button onClick={() => void load()}>Atualizar</button>
      </div>

      {msg ? <small>{msg}</small> : null}

      <form onSubmit={saveProfile} style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 12, padding: 12 }}>
        <strong>Perfil da clínica</strong>
        <input placeholder="Nome da clínica" value={profile.clinicName} onChange={(e) => setProfile((v) => ({ ...v, clinicName: e.target.value }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="CNPJ" value={profile.cnpj} onChange={(e) => setProfile((v) => ({ ...v, cnpj: e.target.value }))} />
          <input placeholder="E-mail" value={profile.email} onChange={(e) => setProfile((v) => ({ ...v, email: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="WhatsApp" value={profile.whatsapp} onChange={(e) => setProfile((v) => ({ ...v, whatsapp: e.target.value }))} />
          <input placeholder="URL da logo" value={profile.logoUrl} onChange={(e) => setProfile((v) => ({ ...v, logoUrl: e.target.value }))} />
        </div>
        <input placeholder="Endereço" value={profile.address} onChange={(e) => setProfile((v) => ({ ...v, address: e.target.value }))} />
        <button type="submit">Salvar perfil</button>
      </form>

      <form onSubmit={saveAgenda} style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 12, padding: 12 }}>
        <strong>Agenda</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <small>Hora inicial</small>
            <input type="number" min={0} max={23} value={agenda.workStartHour} onChange={(e) => setAgenda((v) => ({ ...v, workStartHour: Number(e.target.value) }))} />
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <small>Hora final</small>
            <input type="number" min={1} max={24} value={agenda.workEndHour} onChange={(e) => setAgenda((v) => ({ ...v, workEndHour: Number(e.target.value) }))} />
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <small>Intervalo do slot (min)</small>
            <input type="number" min={5} max={120} value={agenda.slotMinutes} onChange={(e) => setAgenda((v) => ({ ...v, slotMinutes: Number(e.target.value) }))} />
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <small>Buffer entre consultas (min)</small>
            <input type="number" min={0} max={180} value={agenda.bufferMinutes} onChange={(e) => setAgenda((v) => ({ ...v, bufferMinutes: Number(e.target.value) }))} />
          </div>
        </div>
        <button type="submit">Salvar agenda</button>
      </form>

      <form onSubmit={changeAdminPassword} style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 12, padding: 12 }}>
        <strong>Segurança da conta administrativa</strong>
        <input type="password" placeholder="Nova senha do administrador" value={adminNewPassword} onChange={(e) => setAdminNewPassword(e.target.value)} required />
        <button type="submit">Salvar nova senha</button>
      </form>

      <div style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 12, padding: 12 }}>
        <strong>Profissionais (Funcionários)</strong>
        <small style={{ color: '#7a2e65' }}>Cadastro de equipe para acesso ao painel administrativo.</small>

        <form onSubmit={saveProfessional} style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Nome do profissional" value={newProfessional.name} onChange={(e) => setNewProfessional((v) => ({ ...v, name: e.target.value }))} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input type="email" placeholder="E-mail" value={newProfessional.email} onChange={(e) => setNewProfessional((v) => ({ ...v, email: e.target.value }))} required />
            <input placeholder="Telefone" value={newProfessional.phone} onChange={(e) => setNewProfessional((v) => ({ ...v, phone: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input type="password" placeholder={editingProfessionalId ? 'Nova senha (opcional)' : 'Senha inicial'} value={newProfessional.password} onChange={(e) => setNewProfessional((v) => ({ ...v, password: e.target.value }))} required={!editingProfessionalId} />
            <select value={newProfessional.role} onChange={(e) => setNewProfessional((v) => ({ ...v, role: e.target.value as RoleOption }))}>
              <option value="CLIENT">Cliente</option>
              <option value="OWNER">Owner</option>
              <option value="FUNCIONARIO">Funcionário</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">{editingProfessionalId ? 'Salvar edição' : 'Adicionar profissional'}</button>
            {editingProfessionalId ? <button type="button" onClick={() => { setEditingProfessionalId(null); setNewProfessional({ name: '', email: '', phone: '', password: '', role: 'ADMIN' }); }}>Cancelar</button> : null}
          </div>
        </form>

        <div style={{ display: 'grid', gap: 6 }}>
          {professionals.length === 0 ? <div>Nenhum profissional cadastrado.</div> : null}
          {professionals.map((pro) => (
            <div key={pro.id} style={{ border: '1px solid #f3d4fa', borderRadius: 8, padding: 8, display: 'grid', gap: 6 }}>
              <div><strong>{pro.name}</strong> · {pro.role === 'ADMIN' ? 'Admin / Funcionário' : pro.role === 'OWNER' ? 'Owner' : 'Cliente'}</div>
              <div>{pro.email} {pro.phone ? `· ${pro.phone}` : ''}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => startEditProfessional(pro)}>Editar</button>
                <button type="button" onClick={() => void deleteProfessional(pro)} style={{ background: '#be123c' }}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8, border: '1px solid #f0abfc', borderRadius: 12, padding: 12 }}>
        <strong>Usuários e permissões</strong>
        <small style={{ color: '#7a2e65' }}>Visão das permissões cadastradas (edição avançada via módulo de permissões).</small>
        <div style={{ display: 'grid', gap: 6 }}>
          {permissions.length === 0 ? <div>Nenhuma permissão listada (ou sem acesso ADMIN).</div> : null}
          {permissions.slice(0, 50).map((p, idx) => (
            <div key={p.id || `${p.role}-${p.resource}-${idx}`} style={{ border: '1px solid #f3d4fa', borderRadius: 8, padding: 8 }}>
              <strong>{p.role || 'N/A'}</strong> · {p.resource}
              <div>Ver: {p.canView ? 'Sim' : 'Não'} | Criar: {p.canCreate ? 'Sim' : 'Não'} | Editar: {p.canEdit ? 'Sim' : 'Não'} | Excluir: {p.canDelete ? 'Sim' : 'Não'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
