import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import './EnergyComparison.css'; // Importando o CSS

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      const response = await axios.post('http://localhost:5000/chat', { prompt: input });

      // Garantindo que o dado retornado é válido antes de processar
      if (response.data && response.data.response) {
        const botMessage = {
          role: 'bot',
          content: formatResponse(response.data.response),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        console.error('Resposta inválida da API:', response.data);
        const errorMessage = {
          role: 'bot',
          content: 'Desculpe, ocorreu um erro ao processar sua solicitação.',
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = {
        role: 'bot',
        content: 'Desculpe, não foi possível conectar ao servidor.',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput('');
  };

  const formatResponse = (response) => {
    try {
      const data = JSON.parse(response);
  
      // Verifica se a chave 'recomendacao' existe e processa a resposta se ela estiver presente
      if (data.recomendacao) {
        console.warn('Formato inesperado:', data);
  
        // Formata a mensagem de recomendação
        return `
          País: ${data.recomendacao.pais || 'N/A'}\n
          Localização: ${data.recomendacao.localizacao || 'N/A'}\n
          Tipo de Energia: ${data.recomendacao.tipo_energia || 'N/A'}\n
          Justificativa: ${data.recomendacao.justificativa || 'Informação não disponível'}\n
        `;
      }
  
      // Se a chave 'recomendacao' não existir, processa a resposta com a estrutura 'comparativo'
      if (!data.comparativo || typeof data.comparativo !== 'object') {
        console.warn('Formato inesperado:', data);
        return 'Os dados sobre energia renovável não estão disponíveis no momento. Tente novamente mais tarde.';
      }
  
      const comparativo = data.comparativo;
      let formattedMessage = '';
  
      comparativo.energia.forEach((tipo) => {
        const tipoLower = tipo.toLowerCase();
  
        formattedMessage += `
          Tipo: ${tipo}\n
          Custo Médio Anual: ${comparativo.custo_medio_anual && comparativo.custo_medio_anual[tipoLower] ? comparativo.custo_medio_anual[tipoLower] : 'N/A'}\n
          Eficiência Energética: ${comparativo.eficiencia_energetica && comparativo.eficiencia_energetica[tipoLower] ? comparativo.eficiencia_energetica[tipoLower] : 'N/A'}\n
          Emissões de CO2: ${comparativo.emissoes_co2 && comparativo.emissoes_co2[tipoLower] ? comparativo.emissoes_co2[tipoLower] : 'N/A'}\n
          Top 3 Países: ${(comparativo.top3_paises && comparativo.top3_paises[tipoLower] ? comparativo.top3_paises[tipoLower].join(', ') : 'N/A')}\n\n
        `;
      });
  
      return formattedMessage.trim();
    } catch (error) {
      console.error('Erro ao processar a resposta:', error);
      return 'A resposta da IA não pôde ser processada. Tente novamente.';
    }
  };
  
  
  
  
  return (
    <Box className="chat-box">
      <Typography variant="h6" gutterBottom>Chat com a IA</Typography>
      <Box className="messages">
        {messages.map((msg, index) => (
          <Typography key={index} className={msg.role === 'user' ? 'user' : 'bot'}>
            {msg.content}
          </Typography>
        ))}
      </Box>
      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') sendMessage();
        }}
        placeholder="Digite sua mensagem..."
        variant="outlined"
        size="small"
        className="chat-input"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={sendMessage}
        className="chat-btn"
      >
        Enviar
      </Button>
    </Box>
  );
};

export default ChatBox;
