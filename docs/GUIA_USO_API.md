# API de Municípios de Portugal - Guia de Uso

## 🚀 Como Iniciar

1. **Instalar dependências** (apenas na primeira vez):
```powershell
npm install
```

2. **Iniciar o servidor** (no diretório do projeto):
```powershell
npm start
# ou em modo desenvolvimento:
npm run dev
```

3. **Aceder aos serviços**:
- **API:** http://localhost:3000/api/municipios
- **Swagger UI:** http://localhost:3000/api-docs
- **Frontend:** http://localhost:3000

> **Nota:** A base de dados SQLite é criada automaticamente em `data/municipios.db`

## 🔑 Autenticação

Todos os endpoints requerem o header `x-api-key` com o valor configurado no `.env`:

```
x-api-key: a79301
```

## 📍 Endpoints Disponíveis

### 1. **Listar Todos os Municípios** (Paginado)
```
GET /api/municipios
```

**Parâmetros Query (opcionais):**
- `page` - Número da página (default: 1)
- `limit` - Itens por página (default: 20)
- `distrito` - Filtrar por distrito

**Exemplos:**
```bash
# Listar primeiros 20 municípios
curl -H "x-api-key: a79301" http://localhost:3000/api/municipios

# Listar página 2 com 5 itens
curl -H "x-api-key: a79301" http://localhost:3000/api/municipios?page=2&limit=5

# Filtrar por distrito
curl -H "x-api-key: a79301" "http://localhost:3000/api/municipios?distrito=faro"
```

**Resposta:**
```json
{
  "page": 1,
  "limit": 20,
  "total": 278,
  "totalPages": 14,
  "data": [
    {
      "_id": 1,
      "codigo": "0802",
      "nome": "Albufeira",
      "distrito": "Faro",
      "coordenadas": {
        "latitude": 37.0889,
        "longitude": -8.2504
      },
      "populacao2025": 44158,
      "densidade": 559,
      "ultimaAtualizacao": "2025-12-07T15:42:09.191Z",
      "fonte": "geoapi.pt"
    }
  ]
}
```

---

### 2. **Buscar por ID**
```
GET /api/municipios/{id}
```

**Exemplo:**
```bash
curl -H "x-api-key: a79301" http://localhost:3000/api/municipios/674b9c4a1234567890abcdef
```

**Uso no Swagger:** Primeiro liste os municípios e copie o `_id` de um deles.

---

### 3. **Buscar por Código** ✅ **NOVO**
```
GET /api/municipios/codigo/{codigo}
```

**Exemplo:**
```bash
curl -H "x-api-key: a79301" http://localhost:3000/api/municipios/codigo/0802
```

**Uso no Swagger:** Use o código do município (ex: 0802 para Faro)

---

### 4. **Buscar por Nome** ✅ **NOVO**
```
GET /api/municipios/nome/{nome}
```

**Exemplo:**
```bash
curl -H "x-api-key: a79301" http://localhost:3000/api/municipios/nome/Lisboa
```

**Uso no Swagger:** Use o nome exato do município (case-insensitive)

---

### 5. **Listar por Distrito**
```
GET /api/municipios/distrito/{distrito}
```

**Exemplo:**
```bash
curl -H "x-api-key: a79301" http://localhost:3000/api/municipios/distrito/faro
```

**Resposta:** Array de todos os municípios do distrito especificado.

---

## 🔍 Diferença entre os Endpoints de Busca

| Endpoint | O que Busca | Exemplo | Quando Usar |
|----------|-------------|---------|-------------|
| `/api/municipios/{id}` | ID do MongoDB (ObjectId) | `674b9c4a...` | Quando já tem o `_id` de uma busca anterior |
| `/api/municipios/codigo/{codigo}` | Código do município | `0802` | Quando conhece o código oficial |
| `/api/municipios/nome/{nome}` | Nome do município | `Lisboa` | Quando conhece o nome exato |
| `/api/municipios/distrito/{distrito}` | Todos os municípios de um distrito | `Faro` | Para listar todos de uma região |

---

## ⚠️ Erros Comuns

### Erro 401: Acesso negado
**Causa:** API Key ausente ou inválida  
**Solução:** Adicionar o header `x-api-key: a79301`

### Erro 404: Município não encontrado
**Causa:** ID, código ou nome não existe  
**Solução:** Verificar se o valor está correto

### Erro 500: Cast to ObjectId failed
**Causa:** Tentou usar `/api/municipios/{id}` com um código em vez de ObjectId  
**Solução:** Use `/api/municipios/codigo/{codigo}` em vez disso

---

## 💡 Dicas de Uso no Swagger UI

1. **Autenticação:**
   - Clique no botão **"Authorize"** (cadeado) no topo
   - Insira: `a79301`
   - Clique em "Authorize" e depois "Close"

2. **Testar Endpoints:**
   - Clique em "Try it out" no endpoint desejado
   - Preencha os parâmetros necessários
   - Clique em "Execute"

3. **Copiar ObjectId:**
   - Execute `GET /api/municipios` primeiro
   - Copie o `_id` de um município
   - Use esse `_id` no endpoint `GET /api/municipios/{id}`

---

## 📊 Sincronização de Dados

A API sincroniza automaticamente com a **geoapi.pt**:
- ✅ **Na inicialização** do servidor
- ✅ **A cada hora** (agendado via cron)

Total de municípios do continente: **278**

---

## 🛠️ Estrutura dos Dados

```javascript
{
  "_id": "ObjectId do MongoDB",
  "codigo": "Código oficial (pode ser null)",
  "nome": "Nome do município (único)",
  "distrito": "Distrito ao qual pertence",
  "coordenadas": {
    "latitude": 37.0889,
    "longitude": -8.2504
  },
  "populacao2025": "População estimada",
  "densidade": "Densidade populacional (hab/km²)",
  "ultimaAtualizacao": "Data da última sincronização",
  "fonte": "geoapi.pt"
}
```

---

## 🎯 Exemplos Práticos

### PowerShell
```powershell
# Listar todos os municípios do Porto
Invoke-WebRequest -Uri "http://localhost:3000/api/municipios/distrito/porto" `
  -Headers @{"x-api-key"="a79301"} | 
  Select-Object -ExpandProperty Content | 
  ConvertFrom-Json

# Buscar município específico por nome
Invoke-WebRequest -Uri "http://localhost:3000/api/municipios/nome/Coimbra" `
  -Headers @{"x-api-key"="a79301"} | 
  Select-Object -ExpandProperty Content | 
  ConvertFrom-Json
```

### JavaScript/Fetch
```javascript
// Buscar por código
fetch('http://localhost:3000/api/municipios/codigo/0802', {
  headers: {
    'x-api-key': 'a79301'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📝 Notas

- Apenas municípios do **continente** são sincronizados (exclui Açores e Madeira)
- A sincronização pode demorar ~30 segundos (308 municípios, 100ms delay entre cada)
- Os dados de população e densidade são calculados/estimados com base nos censos quando disponíveis

---

Desenvolvido por: **Bernardo Freitas (a79295) & Tomás Anastácio (a79301)**
