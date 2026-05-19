import QRCode from 'qrcode';

/**
 * Gera um QR Code em formato Base64 (data URL) a partir de um texto.
 * Adaptado do utilitário do Rafa (qrCodeUtil.ts)
 * @param texto - O conteúdo a codificar no QR Code (ex: token do bilhete)
 * @returns Uma string Base64 no formato "data:image/png;base64,..."
 */
export const gerarQRCodeBase64 = async (texto: string): Promise<string> => {
    return QRCode.toDataURL(texto, {
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF',
        },
    });
};
