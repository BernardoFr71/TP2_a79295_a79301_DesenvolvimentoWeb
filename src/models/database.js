const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Criar base de dados na raiz do projeto
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'municipios.db');
const db = new Database(dbPath);

// Ativar WAL mode para melhor performance
db.pragma('journal_mode = WAL');

// Criar tabela de municípios
db.exec(`
  CREATE TABLE IF NOT EXISTS municipios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT,
    nome TEXT NOT NULL UNIQUE,
    distrito TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    populacao2025 INTEGER,
    densidade INTEGER,
    ultimaAtualizacao TEXT DEFAULT CURRENT_TIMESTAMP,
    fonte TEXT DEFAULT 'geoapi.pt'
  )
`);

// Criar índices para consultas rápidas
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_distrito ON municipios(distrito);
  CREATE INDEX IF NOT EXISTS idx_codigo ON municipios(codigo);
  CREATE INDEX IF NOT EXISTS idx_ultimaAtualizacao ON municipios(ultimaAtualizacao DESC);
`);

// ============== Funções CRUD ==============

// Upsert (INSERT ou UPDATE)
const upsert = db.prepare(`
  INSERT INTO municipios (codigo, nome, distrito, latitude, longitude, populacao2025, densidade, ultimaAtualizacao, fonte)
  VALUES (@codigo, @nome, @distrito, @latitude, @longitude, @populacao2025, @densidade, @ultimaAtualizacao, @fonte)
  ON CONFLICT(nome) DO UPDATE SET
    codigo = excluded.codigo,
    distrito = excluded.distrito,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    populacao2025 = excluded.populacao2025,
    densidade = excluded.densidade,
    ultimaAtualizacao = excluded.ultimaAtualizacao,
    fonte = excluded.fonte
`);

// Contar registos com filtro opcional
const countAll = (filter = {}) => {
  let sql = 'SELECT COUNT(*) as total FROM municipios';
  const params = [];
  
  if (filter.distrito) {
    sql += ' WHERE distrito LIKE ?';
    params.push(`%${filter.distrito}%`);
  }
  
  return db.prepare(sql).get(...params).total;
};

// Buscar todos com paginação e filtro
const findAll = (options = {}) => {
  const { page = 1, limit = 20, distrito = null, orderBy = 'nome', order = 'ASC' } = options;
  const offset = (page - 1) * limit;
  
  let sql = 'SELECT * FROM municipios';
  const params = [];
  
  if (distrito) {
    sql += ' WHERE distrito LIKE ?';
    params.push(`%${distrito}%`);
  }
  
  sql += ` ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  return db.prepare(sql).all(...params);
};

// Buscar por ID
const findById = (id) => {
  return db.prepare('SELECT * FROM municipios WHERE id = ?').get(id);
};

// Buscar por código
const findByCodigo = (codigo) => {
  return db.prepare('SELECT * FROM municipios WHERE codigo LIKE ?').get(`%${codigo}%`);
};

// Buscar por nome (case-insensitive, pesquisa parcial)
const findByNome = (nome) => {
  return db.prepare('SELECT * FROM municipios WHERE nome LIKE ? COLLATE NOCASE').get(`%${nome}%`);
};

// Buscar por distrito
const findByDistrito = (distrito) => {
  return db.prepare('SELECT * FROM municipios WHERE distrito LIKE ? COLLATE NOCASE ORDER BY nome ASC').all(`%${distrito}%`);
};

// Criar novo registo
const create = (data) => {
  const stmt = db.prepare(`
    INSERT INTO municipios (codigo, nome, distrito, latitude, longitude, populacao2025, densidade, ultimaAtualizacao, fonte)
    VALUES (@codigo, @nome, @distrito, @latitude, @longitude, @populacao2025, @densidade, @ultimaAtualizacao, @fonte)
  `);
  
  const info = stmt.run({
    codigo: data.codigo || null,
    nome: data.nome,
    distrito: data.distrito,
    latitude: data.coordenadas?.latitude || null,
    longitude: data.coordenadas?.longitude || null,
    populacao2025: data.populacao2025 || null,
    densidade: data.densidade || null,
    ultimaAtualizacao: new Date().toISOString(),
    fonte: data.fonte || 'geoapi.pt'
  });
  
  return findById(info.lastInsertRowid);
};

// Atualizar registo
const update = (id, data) => {
  const existing = findById(id);
  if (!existing) return null;
  
  const stmt = db.prepare(`
    UPDATE municipios SET
      codigo = COALESCE(@codigo, codigo),
      nome = COALESCE(@nome, nome),
      distrito = COALESCE(@distrito, distrito),
      latitude = COALESCE(@latitude, latitude),
      longitude = COALESCE(@longitude, longitude),
      populacao2025 = COALESCE(@populacao2025, populacao2025),
      densidade = COALESCE(@densidade, densidade),
      ultimaAtualizacao = @ultimaAtualizacao
    WHERE id = @id
  `);
  
  stmt.run({
    id,
    codigo: data.codigo || null,
    nome: data.nome || null,
    distrito: data.distrito || null,
    latitude: data.coordenadas?.latitude || null,
    longitude: data.coordenadas?.longitude || null,
    populacao2025: data.populacao2025 || null,
    densidade: data.densidade || null,
    ultimaAtualizacao: new Date().toISOString()
  });
  
  return findById(id);
};

// Remover registo
const remove = (id) => {
  const existing = findById(id);
  if (!existing) return null;
  
  db.prepare('DELETE FROM municipios WHERE id = ?').run(id);
  return existing;
};

// Função de upsert para sincronização
const upsertMunicipio = (data) => {
  upsert.run({
    codigo: data.codigo || null,
    nome: data.nome,
    distrito: data.distrito,
    latitude: data.coordenadas?.latitude || null,
    longitude: data.coordenadas?.longitude || null,
    populacao2025: data.populacao2025 || null,
    densidade: data.densidade || null,
    ultimaAtualizacao: new Date().toISOString(),
    fonte: data.fonte || 'geoapi.pt'
  });
};

module.exports = {
  db,
  countAll,
  findAll,
  findById,
  findByCodigo,
  findByNome,
  findByDistrito,
  create,
  update,
  remove,
  upsertMunicipio
};
