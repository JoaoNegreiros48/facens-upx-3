from flask import Flask, jsonify, request
from flask_cors import CORS  # Importar o CORS
import pandas as pd
from dotenv import load_dotenv
import os
import google.generativeai as genai

# Configuração da IA generativa
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

generation_config = {
    "temperature": 0,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction=(
        "Você é um renomado engenheiro de energias renováveis que presta consultorias "
        "para empreendedores que querem saber qual tipo de energia é a melhor para sua empresa. "
        "Você deve realizar comparativos considerando custo médio anual, eficiência energética, "
        "emissões de CO2 e os top 3 países que mais utilizam esses tipos de energia."
    ),
)

chat = model.start_chat(history=[])

# Configuração da API Flask
app = Flask(__name__)
CORS(app)

# Carregar os dados
file_path_1 = 'datasets/global-data-on-sustainable-energy (1).csv'
file_path_2 = 'datasets/complete_renewable_energy_dataset.csv'

data_1 = pd.read_csv(file_path_1)
data_2 = pd.read_csv(file_path_2)

# Limpar e preparar os dados
data_1_clean = data_1[['Entity', 'Year', 
                       'Renewable-electricity-generating-capacity-per-capita', 
                       'Renewable energy share in the total final energy consumption (%)', 
                       'Electricity from fossil fuels (TWh)', 
                       'Electricity from nuclear (TWh)', 
                       'Value_co2_emissions_kt_by_country']]

data_1_clean.columns = ['Country', 'Year', 'Renewable_capacity_per_capita', 
                        'Renewable_energy_share', 'Fossil_fuel_electricity', 
                        'Nuclear_electricity', 'CO2_emissions']

data_2_clean = data_2[['Country', 'Year', 'Energy Type', 
                       'Production (GWh)', 'Installed Capacity (MW)', 
                       'Investments (USD)', 'Proportion of Energy from Renewables']]

data_2_clean.columns = ['Country', 'Year', 'Energy_Type', 
                        'Production_GWh', 'Installed_Capacity_MW', 
                        'Investments_USD', 'Renewable_proportion']

# Fazer a fusão das bases de dados
merged_data = pd.merge(data_1_clean, data_2_clean, on=['Country', 'Year'], how='inner')

# Calcular métricas importantes
merged_data['Cost_per_GWh'] = merged_data['Investments_USD'] / merged_data['Production_GWh']
merged_data['Efficiency_GWh_per_MW'] = merged_data['Production_GWh'] / merged_data['Installed_Capacity_MW']

@app.route('/energies', methods=['GET'])
def get_energies():
    """Retorna as fontes de energia disponíveis."""
    try:
        available_energies = merged_data['Energy_Type'].unique().tolist()
        return jsonify({'available_energies': available_energies})
    except Exception as e:
        print(f"Erro ao obter fontes de energia: {e}")
        return jsonify({"error": "Erro interno ao obter fontes de energia."}), 500

@app.route('/compare', methods=['POST'])
def compare_energies():
    """Compara duas fontes de energia e retorna o resultado."""
    try:
        data = request.json
        energy1 = data.get('energy1')
        energy2 = data.get('energy2')

        if not energy1 or not energy2:
            return jsonify({"error": "Você deve fornecer duas fontes de energia para comparação."}), 400

        energy1_data = merged_data[merged_data['Energy_Type'] == energy1]
        energy2_data = merged_data[merged_data['Energy_Type'] == energy2]

        if energy1_data.empty or energy2_data.empty:
            return jsonify({"error": "Uma ou ambas as fontes de energia fornecidas não foram encontradas."}), 404

        avg_cost_energy1 = energy1_data['Cost_per_GWh'].mean()
        avg_efficiency_energy1 = energy1_data['Efficiency_GWh_per_MW'].mean()
        avg_co2_energy1 = energy1_data['CO2_emissions'].mean()
        top_countries_energy1 = energy1_data.groupby('Country')['Production_GWh'].sum().nlargest(3).index.tolist()

        avg_cost_energy2 = energy2_data['Cost_per_GWh'].mean()
        avg_efficiency_energy2 = energy2_data['Efficiency_GWh_per_MW'].mean()
        avg_co2_energy2 = energy2_data['CO2_emissions'].mean()
        top_countries_energy2 = energy2_data.groupby('Country')['Production_GWh'].sum().nlargest(3).index.tolist()

        comparison_results = {
            "Energy Comparison": {
                energy1: {
                    "Average Cost (USD/GWh)": avg_cost_energy1,
                    "Average Efficiency (GWh/MW)": avg_efficiency_energy1,
                    "Average CO2 Emissions (kt)": avg_co2_energy1,
                    "Top 3 Countries": top_countries_energy1
                },
                energy2: {
                    "Average Cost (USD/GWh)": avg_cost_energy2,
                    "Average Efficiency (GWh/MW)": avg_efficiency_energy2,
                    "Average CO2 Emissions (kt)": avg_co2_energy2,
                    "Top 3 Countries": top_countries_energy2
                }
            }
        }

        return jsonify(comparison_results)
    except Exception as e:
        print(f"Erro ao comparar energias: {e}")
        return jsonify({"error": "Erro interno ao processar a comparação de energias."}), 500

@app.route('/chat', methods=['POST'])
def chat_with_ai():
    """Interage com a IA para responder perguntas sobre energias."""
    try:
        data = request.json
        user_input = data.get('prompt')

        if not user_input:
            return jsonify({"error": "Você deve fornecer uma entrada para o chat."}), 400

        response = chat.send_message(user_input)
        return jsonify({"response": response.text})
    except Exception as e:
        print(f"Erro ao processar mensagem para o chat: {e}")
        return jsonify({"error": "Erro interno ao processar a mensagem."}), 500

if __name__ == '__main__':
    app.run(debug=True)
