const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Simula o envio de e-mail de confirmação com os bilhetes comprados imprimindo no terminal.
 * Zero dependências externas (sem resend ou nodemailer), ideal para apresentações e ambiente local gratuito.
 */
export async function enviarEmailBilhetes(toEmail: string, clientName: string, pedidoId: number) {
    const linkPainel = `${baseUrl}/dashboard?tab=tickets`;
    const subject = '🎫 Os seus Bilhetes já estão disponíveis! - UTAD FastTicket';

    console.log("\n" + "📧".repeat(25));
    console.log(`📧 [SIMULAÇÃO DE E-MAIL] Envio com Sucesso!`);
    console.log(`Para: ${toEmail} (${clientName})`);
    console.log(`Assunto: ${subject}`);
    console.log(`Pedido: #${pedidoId}`);
    console.log("-".repeat(50));
    console.log(`Olá, ${clientName}!`);
    console.log(`O seu pagamento foi confirmado e os seus bilhetes já foram emitidos.`);
    console.log(`Podes aceder ao painel para os visualizar através do link:`);
    console.log(`🔗 Link de Acesso: ${linkPainel}`);
    console.log("📧".repeat(25) + "\n");

    return { success: true, simulated: true };
}

/**
 * Simula o envio de e-mail de boas-vindas após registo tradicional.
 */
export async function enviarEmailBoasVindas(toEmail: string, clientName: string, role: string) {
    const linkPainel = `${baseUrl}/dashboard`;
    const roleText = role === 'ORGANIZADOR' ? 'Organizador de Eventos' : 'Participante';
    const subject = '🎉 Bem-vindo ao UTAD FastTicket!';

    console.log("\n" + "📧".repeat(25));
    console.log(`📧 [SIMULAÇÃO DE E-MAIL] Envio com Sucesso!`);
    console.log(`Para: ${toEmail} (${clientName})`);
    console.log(`Assunto: ${subject}`);
    console.log(`Tipo de Conta: ${roleText}`);
    console.log("-".repeat(50));
    console.log(`Olá, ${clientName}!`);
    console.log(`A sua conta foi criada com sucesso como ${roleText}.`);
    console.log(`Aceda ao seu painel em:`);
    console.log(`🔗 Link de Acesso: ${linkPainel}`);
    console.log("📧".repeat(25) + "\n");

    return { success: true, simulated: true };
}

/**
 * Simula o envio de e-mail de criação de conta automática após checkout como convidado.
 */
export async function enviarEmailCriacaoContaCheckout(toEmail: string, clientName: string, hasPassword: boolean) {
    const linkPainel = `${baseUrl}/dashboard`;
    const linkPerfil = `${baseUrl}/dashboard?tab=profile`;
    const subject = '🎉 Conta Criada! Bem-vindo ao UTAD FastTicket';

    console.log("\n" + "📧".repeat(25));
    console.log(`📧 [SIMULAÇÃO DE E-MAIL] Envio com Sucesso!`);
    console.log(`Para: ${toEmail} (${clientName})`);
    console.log(`Assunto: ${subject}`);
    console.log("-".repeat(50));
    console.log(`Olá, ${clientName}!`);
    console.log(`A sua conta foi criada automaticamente após a compra.`);
    if (!hasPassword) {
        console.log(`⚠️ ATENÇÃO: Não definiu palavra-passe. Aceda ao perfil para definir uma:`);
        console.log(`🔗 Definir Password: ${linkPerfil}`);
    } else {
        console.log(`Aceda à sua conta em:`);
        console.log(`🔗 Link de Acesso: ${linkPainel}`);
    }
    console.log("📧".repeat(25) + "\n");

    return { success: true, simulated: true };
}
