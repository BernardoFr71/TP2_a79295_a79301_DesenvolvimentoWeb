# Desenho e Arquitetura do Sistema  
**Projeto de Integração de Sistemas de Informação**  
Disciplina: Desenvolvimento de Aplicações Web  
Data: 18 de novembro de 2025  
Autores: [Bernardo Freitas / Grupo a79295_a79301]

---

## 1. Visão Geral da Arquitetura

O sistema é composto por três grandes componentes principais:

1. **Fonte de Dados Externa**  
   API pública portuguesa: **https://json.geoapi.pt** (explicitamente sugerida no enunciado)  
   Endpoints utilizados:
   - `GET https://json.geoapi.pt/municipios` → todos os municípios de Portugal  
   - `GET https://json.geoapi.pt/distrito/{distrito}` → dados por distrito

2. **Sistema Local (Backend Node.js)**  
   - Framework: Express.js  
   - Base de dados: MongoDB (com Mongoose)  
   - Sincronização automática via node-cron (agendada a cada hora)  
   - Filtragem: exclui Açores e Madeira (apenas continente)  
   - Processamento: enriquecimento dos dados com campos calculados (população estimada 2025, densidade populacional, timestamp de atualização)  
   - Segurança: autenticação via API Key (header `x-api-key`)

3. **API REST Exposta para Consumo Externo**  
   - Base URL: `/api/municipios`  
   - Operações CRUD completas  
   - Documentação dinâmica com Swagger UI (OpenAPI 3.0) disponível em `/api-docs`

---

## 2. Diagrama de Fluxo de Dados (melhorado em relação à Figura 1 do enunciado)

```
+----------------+       HTTP       +----------------------+
|   geoapi.pt    | <-------------> |   Node.js (Express)  |
| (Fonte externa)|   (Axios)       | - Sync Service (cron)|
+----------------+                 | - Filtragem          |
                                   | - Processamento      |
                                   | - Armazenamento      |
                                   +----------+-----------+
                                              |
                                              v
                                       +-------------+
                                       |  MongoDB    |
                                       | (geoapi_db) |
                                       +-------------+
                                              |
                                              v
                                   +----------------------+
                                   |   API REST Externa   |
                                   | /api/municipios      |
                                   | /api-docs (Swagger)  |
                                   +----------------------+
                                              ^
                                              |
                                    +---------+----------+
                                    | Cliente Autorizado |
                                    | (com x-api-key)    |
                                    +--------------------+
```

---

```
## 3. Fluxos de Dados Detalhados

### Fluxo 1 – Sincronização Automática (agendada)
1. node-cron dispara a cada hora (`0 * * * *`)
2. Requisição GET para `https://json.geoapi.pt/municipios`
3. Filtragem: descarta municípios dos distritos "Açores" e "Madeira"
4. Processamento: cálculo de população estimada 2025 e densidade
5. Upsert (update or insert) no MongoDB usando o campo `codigo` como chave única

### Fluxo 2 – Consulta via API REST
1. Cliente envia pedido com header `x-api-key`
2. Middleware valida a chave
3. Controller consulta coleção `municipios` no MongoDB (com índices para performance)
4. Resposta JSON paginada ou filtrada

---

## 4. Modelo de Segurança

| Mecanismo              | Implementação                                 | Observações                         |
|------------------------|-----------------------------------------------|-------------------------------------|
| Autenticação           | API Key via header `x-api-key`                | Valor definido em `.env`            |
| Validação              | Middleware personalizado                      | Retorna 401 se inválida             |
| Proteção de rotas      | Todas as rotas `/api/municipios/*` protegidas | Exceto `/api-docs` (público)        |
| Boas práticas          | Helmet.js, CORS configurado, rate limiting    | Prevenção de ataques comuns         |

Futuro upgrade possível: OAuth 2.0 com Passport.js (já preparado no código).

---

## 5. Design da API REST (Endpoints)

| Método | Endpoint                          | Descrição                                    | Parâmetros Query | Autenticação |
|--------|-----------------------------------|----------------------------------------------|------------------|--------------|
| GET    | `/api/municipios`                 | Lista todos (paginado)                       | page, limit, distrito | Sim          |
| GET    | `/api/municipios/:id`             | Detalhes de um município                     | -                | Sim          |
| GET    | `/api/municipios/distrito/:distrito` | Filtra por distrito                       | -                | Sim          |
| POST   | `/api/municipios`                 | Criação manual (útil para testes/admin)      | body JSON        | Sim          |
| PUT    | `/api/municipios/:id`             | Atualização total                            | body JSON        | Sim          |
| DELETE | `/api/municipios/:id`             | Remoção                                      | -                | Sim          |

**Formatos**:  
- Request → JSON  
- Response → JSON (com `status`, `data`, `message`)  
- Erros → códigos HTTP padrão + mensagem clara

---

## 6. Modelo de Dados no MongoDB (Coleção `municipios`)

```json
{
  "codigo": "1101",                       // String (chave única)
  "nome": "Arouca",
  "distrito": "Aveiro",
  "coordenadas": { "latitude": 40.93, "longitude": -8.24 },
  "populacao2025": 21500,                 // campo processado
  "densidade": 148.7,                     // calculada
  "ultimaAtualizacao": "2025-11-18T10:00:00Z",
  "fonte": "geoapi.pt"
}
```

Índices criados:
- `{ codigo: 1 }` (unique)
- `{ distrito: 1 }`
- `{ ultimaAtualizacao: -1 }`

---

## 7. Tecnologias Escolhidas


| Camada              | Tecnologia             | Justificação                            |
|---------------------|------------------------|-----------------------------------------|
| Runtime             | Node.js (v20 LTS)      | Obrigatório no enunciado                |
| Framework Web       | Express.js             | Leve, padrão da indústria               |
| Base de Dados       | MongoDB + Mongoose     | Flexibilidade com dados semi-estruturados |
| Sincronização       | node-cron              | Simples e robusto                       |
| Documentação API    | Swagger UI + YAML      | Exigido no enunciado (OpenAPI)          |
| Segurança           | API Key + Helmet + CORS| Simples e eficaz para o contexto        |

---

## 8. Plano de Implementação (resumo)

| Semana | Atividades                                 | Estado       |
|--------|--------------------------------------------|--------------|
| 18-24 nov | Fase 1, escolha API, arquitetura           | Concluído    |
| 25 nov - 1 dez | Desenvolvimento backend + sincronização | Concluído    |
| 2-8 dez   | API REST + CRUD + Swagger + Segurança      | Concluído    |
| 9-12 dez  | Testes, documentação final, ZIP            | Concluído    |
| 13 dez    | Entrega final                              | Previsto     |