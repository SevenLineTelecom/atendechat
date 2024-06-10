import nodemailer from 'nodemailer';
import Setting from '../../models/Setting';
import Email from '../../models/Email';
import * as cron from 'node-cron';
import moment from 'moment';

// Função para enviar e-mails
export const SendMail = async (
  companyId: number,
  email: string,
  tokenSenha: string,
  assunto: string,
  mensagem: string,
  sendAt: string, // Adicione sendAt como parâmetro
  cronExpression?: string
) => {
  try {
    // Obtenha as configurações de SMTP do banco de dados
    const url = await Setting.findOne({
      where: {
        companyId,
        key: 'smtpauth',
      },
    });
    const user = await Setting.findOne({
      where: {
        companyId,
        key: 'usersmtpauth',
      },
    });
    const password = await Setting.findOne({
      where: {
        companyId,
        key: 'clientsecretsmtpauth',
      },
    });

    const urlSmtp = url.value;
    const userSmtp = user.value;
    const passwordSmtp = password.value;

    // Configurações para o serviço SMTP (use as configurações do seu provedor)
    const transporter = nodemailer.createTransport({
      host: urlSmtp, // Host SMTP do seu provedor de e-mail
      port: Number('587'), // Porta do SMTP (geralmente 587 ou 465)
      secure: false, // true para TLS, false para outras portas
      auth: {
        user: userSmtp, // Seu endereço de e-mail
        pass: passwordSmtp, // Sua senha de e-mail
      },
    });

    // Função para enviar o e-mail
    async function sendEmail(formattedSendAt: string) {
      try {
        // Configurações do e-mail a ser enviado
        const mailOptions = {
          from: userSmtp, // Seu endereço de e-mail
          to: email, // Destinatário
          subject: assunto, // Assunto do e-mail
          text: mensagem, // Corpo do e-mail (texto)
        };

        // Enviar o e-mail
        await transporter.sendMail(mailOptions);

        // Salvar os dados do email no banco de dados, incluindo sendAt
        await Email.create({
          sender: email,
          subject: assunto,
          message: mensagem,
          companyId: companyId,
        });

        // Retornar uma mensagem de sucesso
        return { message: 'E-mail agendado e salvo com sucesso' };
      } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw new Error('Erro ao enviar e-mail: ' + error);
      }
    }

    // Agendar o envio do e-mail com base na expressão cron, se fornecida
    if (cronExpression) {
      cron.schedule(cronExpression, () => {
        const formattedSendAt = moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm');
        sendEmail(formattedSendAt);
      });
      return { message: 'Agendamento de e-mail realizado com sucesso' };
    } else {
      // Se não houver expressão cron, envie imediatamente
      const formattedSendAt = moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm');
      sendEmail(formattedSendAt);
      return { message: 'E-mail enviado imediatamente' };
    }
  } catch (error) {
    console.error('Erro ao agendar e-mail:', error);
    return { error: 'Erro ao agendar e-mail: ' + error.message };
  }
};

export default SendMail;
