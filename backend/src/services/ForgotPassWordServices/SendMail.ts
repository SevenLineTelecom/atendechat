import nodemailer from "nodemailer";
import sequelize from "sequelize";
import database from "../../database";
import Setting from "../../models/Setting";
import { config } from 'dotenv';


config();

// ******* ALTERAR AQUI **********//

//let companyName = "Multiconnect"; // COLOCAR O NOME DO SISTEMA AQUI - ALTERA DE MODO DINÂMICO O NOME DA EMPRESA NO E-MAIL
//let companyPhone = "(00) 0000-0000"; // COLOCAR O TELEFONE DA MENSAGEM DO E-MAIL DA FATURA-
const companyName = process.env.COMPANY_NAME; // Use a variável de ambiente
const companyPhone = process.env.COMPANY_PHONE; // Use a variável de ambiente



// ******* FIM DA ALTERAÇÃO **********//

interface UserData {
  companyId: number;
  // Outras propriedades que você obtém da consulta
}

const SendMail = async (email: string, tokenSenha: string) => {
  // Verifique se o email existe no banco de dados
  const { hasResult, data } = await filterEmail(email);

  if (!hasResult) {
    return { status: 404, message: "Email não encontrado" };
  }

  const userData = data[0][0] as UserData;

  if (!userData || userData.companyId === undefined) {
    return { status: 404, message: "Dados do usuário não encontrados" };
  }

  const companyId = userData.companyId;

  const urlSmtp = process.env.MAIL_HOST; // Use a variável de ambiente para o host SMTP
  const userSmtp = process.env.MAIL_USER; // Use a variável de ambiente para o usuário SMTP
  const passwordSmpt = process.env.MAIL_PASS; // Use a variável de ambiente para a senha SMTP
  const fromEmail = process.env.MAIL_FROM; // Use a variável de ambiente para o email de origem

  const transporter = nodemailer.createTransport({
    host: urlSmtp,
    port: Number(process.env.MAIL_PORT), // Use a variável de ambiente para a porta SMTP
    secure: false, // O Gmail requer secure como false
    auth: {
      user: userSmtp,
      pass: passwordSmpt
    }
  });

  if (hasResult === true) {
    const { hasResults, datas } = await insertToken(email, tokenSenha);

    async function sendEmail() {
      try {
        const mailOptions = {
          from: fromEmail,
          to: email,
          subject:  `Redefinição de Senha - ${companyName}`,
          text: `Olá,\n\nVocê solicitou a redefinição de senha para sua conta no ${companyName}. Utilize o seguinte Código de Verificação para concluir o processo de redefinição de senha:\n\nCódigo de Verificação: ${tokenSenha}\n\nPor favor, copie e cole o Código de Verificação no campo 'Código de Verificação' na plataforma ${companyName}.\n\nSe você não solicitou esta redefinição de senha, por favor, ignore este e-mail.\n\n\nAtenciosamente,\nEquipe ${companyName}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("E-mail enviado: " + info.response);
      } catch (error) {
        console.log(error);
      }
    }

    sendEmail();
  }
};

// Função para verificar se o email existe no banco de dados
const filterEmail = async (email: string) => {
  const sql = `SELECT * FROM "Users"  WHERE email ='${email}'`;
  const result = await database.query(sql, { type: sequelize.QueryTypes.SELECT });
  return { hasResult: result.length > 0, data: [result] };
};

const insertToken = async (email: string, tokenSenha: string) => {
  const sqls = `UPDATE "Users" SET "resetPassword"= '${tokenSenha}' WHERE email ='${email}'`;
  const results = await database.query(sqls, { type: sequelize.QueryTypes.UPDATE });
  return { hasResults: results.length > 0, datas: results };
};

//export default SendMail;
export { companyName,companyPhone,  SendMail };

