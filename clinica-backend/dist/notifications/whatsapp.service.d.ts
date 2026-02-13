export declare class WhatsAppService {
    private readonly token;
    private readonly phoneNumberId;
    private readonly apiVersion;
    sendText(to: string, body: string): Promise<{
        payload: {
            messaging_product: string;
            to: string;
            type: string;
            text: {
                body: string;
            };
        };
        data: any;
    }>;
}
