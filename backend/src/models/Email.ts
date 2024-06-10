// models/Email.ts
import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Email extends Model<Email> {
  @Column
  sender: string;

  @Column
  subject: string;

  @Column(DataType.TEXT)
  message: string;

  @Column(DataType.BOOLEAN) // Adicione esta coluna para rastrear se o e-mail está agendado
  scheduled: boolean;

  @Column(DataType.DATE) // Adicione esta coluna para armazenar a data/hora do agendamento
  sendAt: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
}

export default Email;
