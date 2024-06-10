// emailRoutes.js
import express from 'express';
import { enviarEmail, listarEmailsAgendados, listarEmailsEnviados, agendarEnvioEmail } from '../controllers/emailController'; // Importe a função para listar os e-mails enviados e a função para agendar o envio de e-mails
import isAuth from '../middleware/isAuth';

const emailRoutes = express.Router();

// Rota para enviar e-mail
emailRoutes.post('/enviar-email', isAuth, enviarEmail);

// Rota para listar os e-mails enviados
emailRoutes.get('/listar-emails-enviados', isAuth, listarEmailsEnviados);

emailRoutes.get('/listar-emails-agendados', isAuth, listarEmailsAgendados);

// Rota para agendar o envio de e-mail
emailRoutes.post('/agendar-envio-email', isAuth, agendarEnvioEmail);

export default emailRoutes;
