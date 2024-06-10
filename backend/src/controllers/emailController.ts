import { Request, Response } from 'express';
import { SendMail } from '../services/EmailService/EmailService';
import Email from '../models/Email';
import moment from 'moment';
import cron from 'node-cron';
import { Op } from 'sequelize';
import winston from 'winston';

// Configurar o logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Função para enviar e-mails
export const enviarEmail = async (req: Request, res: Response) => {
  try {
    // Obtenha o companyId do corpo da solicitação
    const companyId = req.user.companyId;

    // Extrair dados do corpo da requisição
    const { email, tokenSenha, assunto, mensagem } = req.body;

    // Defina a data de envio para uma hora no futuro usando 'moment'
    const sendAt = moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm');

    // Chame a função SendMail do seu arquivo de serviço com o companyId como primeiro argumento
    const result = await SendMail(companyId, email, tokenSenha, assunto, mensagem, sendAt);

    // Verifique se houve um erro na função SendMail
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(200).json({ message: 'E-mail enviado com sucesso' });
  } catch (error) {
    // Se ocorrer um erro, responder com um status de erro
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ error: 'Erro ao enviar e-mail' });
  }
};

// Função para listar os e-mails enviados
export const listarEmailsEnviados = async (req: Request, res: Response) => {
  try {
    // Obtenha os e-mails enviados do banco de dados onde scheduled e sendAt são nulos
    const emailsEnviados = await Email.findAll({
      where: {
        companyId: req.user.companyId,
        scheduled: null,
        sendAt: null,
      },
    });

    // Responda com os e-mails enviados
    res.status(200).json(emailsEnviados);
  } catch (error) {
    // Se ocorrer um erro, responda com um status de erro
    console.error('Erro ao listar e-mails enviados:', error);
    res.status(500).json({ error: 'Erro ao listar e-mails enviados' });
  }
};

export const listarEmailsAgendados = async (req: Request, res: Response) => {
  try {
    // Obtenha os e-mails agendados do banco de dados onde scheduled é verdadeiro
    const emailsAgendados = await Email.findAll({
      where: {
        companyId: req.user.companyId,
        scheduled: true,
        sendAt: {
          [Op.not]: null, // Certifique-se de que o campo sendAt não seja nulo
        },
      },
    });

    // Responda com os e-mails agendados
    res.status(200).json(emailsAgendados);
  } catch (error) {
    // Se ocorrer um erro, responda com um status de erro
    console.error('Erro ao listar e-mails agendados:', error);
    res.status(500).json({ error: 'Erro ao listar e-mails agendados' });
  }
};

// Função para agendar o envio de e-mail
export const agendarEnvioEmail = async (req: Request, res: Response) => {
  try {
    // Obtenha o companyId do corpo da solicitação
    const companyId = req.user.companyId;

    // Extrair dados do corpo da requisição
    const { recipient, subject, message, sendAt } = req.body;

    // Verifique se a data de envio está no futuro
    const sendAtDate = new Date(sendAt);
    if (sendAtDate <= new Date()) {
      return res.status(400).json({ error: 'A data de envio deve ser no futuro' });
    }

    // Salvar os dados do agendamento no banco de dados
    await Email.create({
      sender: req.body.email,    
      subject: req.body.assunto,
      message: req.body.mensagem,
      companyId: companyId,
      scheduled: true,
      sendAt: new Date(sendAt), // Salvar sendAt como uma data
    });

    res.status(200).json({ message: 'E-mail agendado com sucesso' });
  } catch (error) {
    // Se ocorrer um erro, responder com um status de erro
    console.error('Erro ao agendar o envio de e-mail:', error);
    res.status(500).json({ error: 'Erro ao agendar o envio de e-mail' });
  }
};

const enviarAgendamentosPendentes = async () => {
  try {
    const now = moment(); // Obtém a data e hora atual

    // Consulta o banco de dados para obter os agendamentos pendentes
    const agendamentos = await Email.findAll({
      where: {
        scheduled: true,
        sendAt: {
          [Op.lte]: now.toDate(), // Encontre agendamentos com sendAt menor ou igual à data e hora atual
        },
      },
    });

    // Envia os e-mails para os agendamentos encontrados
    for (const agendamento of agendamentos) {
      const result = await SendMail(
        agendamento.companyId,
        agendamento.sender,
        '',
        agendamento.subject,
        agendamento.message,
        agendamento.sendAt.toISOString(),
        ''
      );

      if (!result.error) {
        // Marque o agendamento como enviado no banco de dados
        await agendamento.update({ scheduled: false });

        // Adicione um log de sucesso ao console
        logger.info(`E-mail agendado enviado com sucesso para: ${agendamento.sender}`);
      } else {
        // Adicione um log de erro ao console
        logger.error(`Erro ao enviar e-mail agendado para: ${agendamento.sender}, erro: ${result.error}`);
      }
    }
  } catch (error) {
    // Adicione um log de erro ao console
    logger.error('Erro ao enviar agendamentos pendentes:', error);
  }
};

// Agende a função para ser executada a cada 30 segundos
cron.schedule('*/30 * * * * *', enviarAgendamentosPendentes);
