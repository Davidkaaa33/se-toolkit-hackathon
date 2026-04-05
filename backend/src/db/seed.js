const db = require('./pool');
const { v4: uuidv4 } = require('uuid');

const defaultPlayers = [];

async function seedDatabase() {
  try {
    const { rows } = await db.query('SELECT COUNT(*) FROM players');
    const count = parseInt(rows[0].count, 10);

    if (count > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    for (const player of defaultPlayers) {
      await db.query(
        `INSERT INTO players (id, nickname, level, age, language, role, style, playtime, discord, bio)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [uuidv4(), player.nickname, player.level, player.age, player.language, player.role, player.style, player.playtime, player.discord, player.bio]
      );
    }

    console.log('Database seeded with default players');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    throw error;
  }
}

if (require.main === module) {
  require('dotenv').config();
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
