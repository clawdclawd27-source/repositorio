import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsAppService {
  private readonly token = process.env.WHATSAPP_TOKEN || '';
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  private readonly apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';

  async sendText(to: string, body: string) {
    if (!this.token || !this.phoneNumberId) {
      throw new Error('WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID não configurados');
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Falha ao enviar WhatsApp');
    }

    return { payload, data };
  }
}
