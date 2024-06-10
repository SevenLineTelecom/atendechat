import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import api from "../../services/api";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
  },
  paper: {
    padding: theme.spacing(3),
    maxWidth: 600,
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  emailSection: {
    marginTop: theme.spacing(2),
  },
}));

const App = () => {
  const classes = useStyles();
  const [sender, setSender] = useState(""); // Altere para uma string
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [emails, setEmails] = useState([]);

  const handleSendEmail = async () => {
    if (subject && message) {
      // Divide a string de sender em um array de endereços de e-mail
      const senderEmails = sender.split(',').map(email => email.trim());

      try {
        for (const email of senderEmails) {
          const response = await api.post(
            `${process.env.REACT_APP_BACKEND_URL}/enviar-email`,
            {
              email,
              tokenSenha: "",
              assunto: subject,
              mensagem: message,
            }
          );

          console.log("Resposta da API para", email, ":", response.data);

          // Adicione o e-mail à lista de e-mails enviados
          setEmails([...emails, { sender: email, subject, message }]);
        }

        // Limpa os campos após o envio
        setSender("");
        setSubject("");
        setMessage("");
      } catch (error) {
        console.error("Erro na API:", error);
      }
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Typography variant="h5" gutterBottom>
            Disparo de Emails
          </Typography>
          <form className={classes.form}>
            <TextField
              label="Destinatario (separe por vírgula)"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              label="Assunto"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              label="Mensagem"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendEmail}
              fullWidth
            >
              Enviar
            </Button>
          </form>
        </Paper>
      </div>
    </Container>
  );
};

export default App;