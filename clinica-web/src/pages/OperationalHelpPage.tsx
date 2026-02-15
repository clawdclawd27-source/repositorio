export function OperationalHelpPage() {
  return (
    <div className="card" style={{ display: 'grid', gap: 14 }}>
      <h2 style={{ margin: 0 }}>Ajuda Operacional (POP)</h2>
      <p style={{ margin: 0 }}>Guia rápido para rotina diária da equipe.</p>

      <section style={{ display: 'grid', gap: 6 }}>
        <strong>1) Abertura do dia (1 min)</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Acesse Notificações.</li>
          <li>Clique em <strong>Atualizar logs</strong>.</li>
          <li>Confirme a mensagem: <strong>Logs atualizados com sucesso</strong>.</li>
        </ul>
      </section>

      <section style={{ display: 'grid', gap: 6 }}>
        <strong>2) Teste de saúde (30s)</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Envie 1 teste de WhatsApp para número interno.</li>
          <li>Verifique no log: <strong>TEST · SENT</strong>.</li>
        </ul>
      </section>

      <section style={{ display: 'grid', gap: 6 }}>
        <strong>3) Disparos do dia</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li><strong>Rodar lembretes de consultas agora</strong> (1x manhã).</li>
          <li><strong>Rodar aniversários agora</strong> (1x dia).</li>
          <li>Conferir se não houve erro novo no topo dos logs.</li>
        </ul>
      </section>

      <section style={{ display: 'grid', gap: 6 }}>
        <strong>4) Tratativa rápida de erros</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li><strong>Número não autorizado</strong>: liberar no Meta (campo “Até”).</li>
          <li><strong>(#10) sem permissão</strong>: gerar novo token e atualizar backend.</li>
          <li><strong>Internal server error</strong>: reiniciar frontend/backend.</li>
        </ul>
      </section>

      <section style={{ display: 'grid', gap: 6 }}>
        <strong>5) Encerramento do dia (30s)</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Atualizar logs.</li>
          <li>Confirmar envios importantes como <strong>SENT</strong>.</li>
          <li>Salvar print de evidência (opcional).</li>
        </ul>
      </section>
    </div>
  );
}
