const db = require('./pool');

async function initDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS players (
      id UUID PRIMARY KEY,
      nickname VARCHAR(50) NOT NULL,
      level INTEGER NOT NULL CHECK (level >= 0 AND level <= 10),
      age INTEGER NOT NULL CHECK (age >= 0 AND age <= 99),
      language VARCHAR(20) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'Any',
      style VARCHAR(30) NOT NULL,
      playtime VARCHAR(50) NOT NULL,
      discord VARCHAR(100) NOT NULL,
      bio TEXT,
      session_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_players_level ON players(level);
    CREATE INDEX IF NOT EXISTS idx_players_role ON players(role);
    CREATE INDEX IF NOT EXISTS idx_players_language ON players(language);
    CREATE INDEX IF NOT EXISTS idx_players_style ON players(style);
    CREATE INDEX IF NOT EXISTS idx_players_session ON players(session_id);
    CREATE INDEX IF NOT EXISTS idx_players_created ON players(created_at DESC);
  `;

  try {
    await db.query(createTableQuery);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
}

if (require.main === module) {
  require('dotenv').config();
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = initDatabase;
