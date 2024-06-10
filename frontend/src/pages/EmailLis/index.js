import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { CSSTransition } from 'react-transition-group';
import api from '../../services/api';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
  },
  paper: {
    padding: theme.spacing(3),
    maxWidth: 800,
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  email: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.spacing(1),
  },
  pagination: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  // Classes para animações de fade
  'email-fade-enter': {
    opacity: 0,
  },
  'email-fade-enter-active': {
    opacity: 1,
    transition: 'opacity 300ms ease-in',
  },
  'email-fade-exit': {
    opacity: 1,
  },
  'email-fade-exit-active': {
    opacity: 0,
    transition: 'opacity 300ms ease-out',
  },
}));

const EmailList = () => {
  const classes = useStyles();
  const [emails, setEmails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const emailsPerPage = 5; // Quantidade de emails por página

  useEffect(() => {
    // Carregar os emails enviados ao montar o componente
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      // Fazer uma requisição à API para obter os emails enviados
      const response = await api.get(`${process.env.REACT_APP_BACKEND_URL}/listar-emails-enviados`);
      setEmails(response.data);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
    }
  };

  const openEmail = (email) => {
    // Define o email selecionado para abrir
    setSelectedEmail(email);
  };

  const closeEmail = () => {
    // Fecha o email selecionado
    setSelectedEmail(null);
  };

  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = emails.slice(indexOfFirstEmail, indexOfLastEmail);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Typography variant="h5" gutterBottom>
            Lista de Emails Enviados
          </Typography>
          {currentEmails.map((email) => (
            <div key={email.id} className={classes.email}>
              <Typography variant="h6">{email.subject}</Typography>
              <Typography variant="subtitle1">Destinatário: {email.sender}</Typography>
              <Typography variant="body1">
                {email.message.length > 100 ? email.message.substring(0, 100) + '...' : email.message}
              </Typography>
              <Button variant="contained" color="primary" onClick={() => openEmail(email)}>
                Abrir Email
              </Button>
            </div>
          ))}
          <div className={classes.pagination}>
            {Array.from({ length: Math.ceil(emails.length / emailsPerPage) }, (_, i) => (
              <Button
                key={i}
                variant="outlined"
                color={currentPage === i + 1 ? 'primary' : 'default'}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </Paper>
        <CSSTransition
          in={selectedEmail !== null}
          timeout={300}
          classNames="email-fade"
          unmountOnExit
        >
          <Paper className={classes.paper}>
            <Typography variant="h6">Email Completo</Typography>
            <Typography variant="h6">{selectedEmail?.subject}</Typography>
            <Typography variant="subtitle1">Destinatário: {selectedEmail?.sender}</Typography>
            <Typography variant="body1">{selectedEmail?.message}</Typography>
            <Button variant="contained" color="primary" onClick={closeEmail}>
              Fechar Email
            </Button>
          </Paper>
        </CSSTransition>
      </div>
    </Container>
  );
};

export default EmailList;
