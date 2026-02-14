import { FormEvent, useEffect, useState } from 'react';
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

const defaultProfile: ClinicProfile = {
  clinicName: '', cnpj: '', address: '', whatsapp: '', email: '', logoUrl: '',
};

const defaultAgenda: Agenda = {
  workStartHour: 8, workEndHour: 18, slotMinutes: 30, bufferMinutes: 10,
};

export function SettingsPage() {
  const [profile, setProfile] = useState<ClinicProfile>(defaultProfile);
  const [agenda, setAgenda] = useState<Agenda>(defaultAgenda);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    setMsg('');
    try {
      const [p, a, perms] = await Promise.all([
        api.get('/settings/clinic-profile'),
        api.get('/settings/agenda'),
        api.get('/permissions').catch(() => ({ data: [] })),
      ]);
      setProfile({ ...defaultProfile, ...(p.data || {}) });
      setAgenda({ ...defaultAgenda, ...(a.data || {}) });
      setPermissions(Array.isArray(perms.data) ? perms.data : []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Erro ao carregar configurações');
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
