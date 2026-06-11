/**
 * Serviço de e-mail simulado para envio de bilhetes do UTAD FastTicket.
 * Imprime os detalhes do bilhete no terminal do servidor.
 */
export async function enviarEmailBilhete(
    email: string,
    nome: string,
    bilhetes: { qrCodeToken: string; loteNome: string }[],
    evento: { titulo: string; localizacao: string; dataInicio: Date | string }
) {
    const dataInicioFormated = new Date(evento.dataInicio).toLocaleString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    console.log("\n" + "=".repeat(75));
    console.log(`📧 [EMAIL SIMULATION] Enviando e-mail para: ${email} (${nome})`);
    console.log(`📝 Assunto: Os seus bilhetes para: "${evento.titulo}"`);
    console.log("-".repeat(75));
    console.log(`Olá ${nome},`);
    console.log(`\nObrigado por adquirir os seus bilhetes para o evento "${evento.titulo}"!`);
    console.log(`\nDetalhes do Evento:`);
    console.log(`📍 Localização: ${evento.localizacao}`);
    console.log(`📅 Data/Hora: ${dataInicioFormated}`);
    console.log(`\nOs seus bilhetes (${bilhetes.length}):`);
    
    bilhetes.forEach((b, idx) => {
        console.log(`  🎫 Bilhete ${idx + 1}:`);
        console.log(`     Lote: ${b.loteNome}`);
        console.log(`     Token de Validação: ${b.qrCodeToken}`);
        console.log(`     Link de Acesso Rápido: http://localhost:3000/dashboard/utilizador`);
        console.log("-".repeat(40));
    });

    console.log("\nApresente o código QR (gerado a partir do token) na entrada do evento.");
    console.log("Tenha um excelente evento!");
    console.log("=".repeat(75) + "\n");
}
