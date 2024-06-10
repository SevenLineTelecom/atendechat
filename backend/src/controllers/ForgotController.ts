import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
//import SendMail from "../services/ForgotPassWordServices/SendMail";
import { SendMail } from "../services/ForgotPassWordServices/SendMail";
import ResetPassword from "../services/ResetPasswordService/ResetPassword";

type IndexQuery = {
  email?: string;
  token?: string;
  password?: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.params as IndexQuery; // Use req.params para obter o email
  const TokenSenha = uuid();

  const forgotPassword = await SendMail(email, TokenSenha);

  if (!forgotPassword) {
    // Houve um erro, pois a função SendMail retornou undefined ou null
    return res.status(404).json({ error: "E-mail enviado com sucesso" });
  }

  return res.json({ message: "E-mail enviado com sucesso" });
};

export const resetPasswords = async (req: Request, res: Response): Promise<Response> => {
  const { email, token, password } = req.params as IndexQuery; // Use req.params para obter o token e a nova senha

  const resetPassword = await ResetPassword(email, token, password);

  if (!resetPassword) {
    // Houve um erro, pois a função ResetPassword retornou undefined ou null
    return res.status(404).json({ error: "Verifique o Token informado" });
  }

  return res.json({ message: "Senha redefinida com sucesso" });
};
