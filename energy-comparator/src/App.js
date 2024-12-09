import React, { useEffect, useState } from 'react';
import { Container, Typography, Select, MenuItem, Button, Grid, Card, CardContent } from '@mui/material';
import axios from 'axios';
import ChatBox from './ChatBox';
import './EnergyComparison.css';  // Importando o CSS

function App() {
  const [energies, setEnergies] = useState([]);
  const [energy1, setEnergy1] = useState('');
  const [energy2, setEnergy2] = useState('');
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/energies')
      .then(response => setEnergies(response.data.available_energies))
      .catch(error => console.error("Erro ao buscar energias:", error));
  }, []);

  const handleCompare = () => {
    axios.post('http://localhost:5000/compare', { energy1, energy2 })
      .then(response => setComparison(response.data))
      .catch(error => console.error("Erro ao comparar energias:", error));
  };

  return (
    <Container className="comparison-container">
      <Typography variant="h4" gutterBottom>Comparador de Energias</Typography>
      
      <Grid container spacing={2} className="energy-selectors">
        <Grid item xs={6} className="selector-group">
          <Select 
            className="energy-select"
            fullWidth 
            value={energy1} 
            onChange={(e) => setEnergy1(e.target.value)}
          >
            <MenuItem value=""><em>Escolha uma energia</em></MenuItem>
            {energies.map(energy => (
              <MenuItem key={energy} value={energy}>{energy}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={6} className="selector-group">
          <Select 
            className="energy-select"
            fullWidth 
            value={energy2} 
            onChange={(e) => setEnergy2(e.target.value)}
          >
            <MenuItem value=""><em>Escolha uma energia</em></MenuItem>
            {energies.map(energy => (
              <MenuItem key={energy} value={energy}>{energy}</MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      <Button 
        className="btn" 
        variant="contained" 
        color="primary" 
        onClick={handleCompare}
        style={{ marginTop: '20px' }}
      >
        Comparar Energias
      </Button>

      {comparison && (
        <Grid container spacing={4} className="comparison-results" style={{ marginTop: '20px' }}>
          {Object.keys(comparison['Energy Comparison']).map(energy => (
            <Grid item xs={6} key={energy}>
              <Card className="card">
                <CardContent>
                  <Typography variant="h5">{energy}</Typography>
                  <Typography variant="body1">
                    Custo Médio (USD/GWh): {comparison['Energy Comparison'][energy]['Average Cost (USD/GWh)']}
                  </Typography>
                  <Typography variant="body1">
                    Eficiência Média (GWh/MW): {comparison['Energy Comparison'][energy]['Average Efficiency (GWh/MW)']}
                  </Typography>
                  <Typography variant="body1">
                    Emissões de CO2 Médias (kt): {comparison['Energy Comparison'][energy]['Average CO2 Emissions (kt)']}
                  </Typography>
                  <Typography variant="body1">
                    Top 3 Países: {comparison['Energy Comparison'][energy]['Top 3 Countries'].join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <ChatBox />
    </Container>
  );
}

export default App;
