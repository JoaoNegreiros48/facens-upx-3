
# Documentação do Projeto

## Estrutura do Projeto
- **server/**: Contém o backend do projeto em Python.
- **energy-comparator/**: Contém o frontend do projeto em React.

---

## Instalação e Configuração do Servidor (Pasta `server`)

### Pré-requisitos:
Certifique-se de que você tenha o Python instalado em sua máquina.  
Você pode verificar isso rodando o seguinte comando no terminal:
```bash
python --version
```

### Instalação de Dependências:
Navegue até a pasta `server`:
```bash
cd server
```
Instale as dependências necessárias:
```bash
pip install Flask flask-cors pandas
```

### Executando o Servidor:
Após a instalação das dependências, você pode executar o servidor com o seguinte comando:
```bash
python server.py
```

---

## Instalação e Configuração do Frontend (Pasta `energy-comparator`)

### Pré-requisitos:
Certifique-se de ter o Node.js e o npm instalados.  
Você pode verificar isso rodando os seguintes comandos no terminal:
```bash
node --version
npm --version
```

### Navegando até a Pasta do Frontend:
Navegue até a pasta `energy-comparator`:
```bash
cd ../energy-comparator
```

### Instalação das Dependências do React:
Instale as dependências necessárias:
```bash
npm install
```

### Executando o Projeto React:
Após a instalação das dependências, você pode iniciar o servidor de desenvolvimento:
```bash
npm start
```
O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000) por padrão.

---

## Funcionalidade do Projeto
O projeto contém dois selectors que permitem ao usuário selecionar diferentes fontes de energia.  
Após selecionar as energias desejadas, o usuário pode pressionar um botão para retornar uma comparação entre ambas.  

Essa funcionalidade permite que os usuários analisem e comparem as características das energias selecionadas.

---

## Considerações Finais
Certifique-se de que o servidor Flask está rodando enquanto você utiliza o frontend em React, para que as requisições sejam processadas corretamente.

---

## Dúvidas e Suporte
Se você tiver dúvidas ou precisar de mais informações sobre o projeto, sinta-se à vontade para perguntar!
