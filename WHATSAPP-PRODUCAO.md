# WhatsApp Produção - Plano de Virada (Clínica Emanuelle Ferreira)

## Objetivo
Sair do ambiente de teste da Meta (com allowlist) e operar envio real de mensagens para clientes.

## Pré-requisitos
- Business Manager verificado.
- WABA ativa e vinculada ao app correto.
- Número oficial da clínica disponível para migração (sem uso ativo no app WhatsApp comum, ou com plano de migração).
- Forma de pagamento adicionada no WhatsApp Manager.

## Passo a passo
1. **Adicionar/migrar número oficial**
   - WhatsApp Manager > Telefones > Adicionar telefone.
   - Se aparecer "Phone Number In Use", concluir migração/desvinculação do uso atual.

2. **Verificação do número**
   - Receber código por SMS/voz e validar.

3. **Gerar token com permissões corretas**
   - Gerar novo token na Meta com acesso de envio (`whatsapp_business_messaging`).
   - Atualizar backend `.env`:
     - `WHATSAPP_TOKEN`
     - `WHATSAPP_PHONE_NUMBER_ID` (novo número oficial)
     - `WHATSAPP_API_VERSION=v22.0`

4. **Reiniciar serviços**
   - `./scripts/clinic-stable.sh start`

5. **Teste técnico**
   - Tela Notificações > Teste de WhatsApp (1 número interno).
   - Confirmar log `TEST · SENT`.

6. **Teste operacional**
   - Rodar lembretes e aniversários.
   - Validar logs sem erros de permissão/allowlist.

## Critérios de aceite
- Envio de teste `SENT` para número fora da allowlist de sandbox.
- Disparos operacionais executando com sucesso.
- Zero erro `(#10)` e zero erro `#131030` após virada.

## Plano de rollback
- Recolocar token/phone id anterior no `.env`.
- Rodar `./scripts/clinic-stable.sh start`.
- Voltar operação para modo teste enquanto ajusta produção.

## Rotina de manutenção
- Monitorar validade/rotação de token.
- Revisar logs diariamente (página Notificações).
- Manter 1 teste interno no início do dia.
