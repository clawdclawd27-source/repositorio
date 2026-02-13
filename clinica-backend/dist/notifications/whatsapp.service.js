"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
let WhatsAppService = class WhatsAppService {
    constructor() {
        this.token = process.env.WHATSAPP_TOKEN || '';
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
        this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    }
    async sendText(to, body) {
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
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = __decorate([
    (0, common_1.Injectable)()
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map