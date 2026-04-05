const db = require('./pool');
const { v4: uuidv4 } = require('uuid');

const defaultPlayers = [
  {
    nickname: 'EdgarRush',
    level: 7,
    age: 19,
    language: 'RU / EN',
    role: 'Rifler',
    style: 'Chill + try win',
    playtime: '19:00–01:00',
    discord: '@edgar',
    bio: 'Ищу адекватных ребят на Faceit 5–8. Без токсика, но на победу.'
  },
  {
    nickname: 'NikoScope',
    level: 6,
    age: 21,
    language: 'RU',
    role: 'AWP',
    style: 'Tryhard',
    playtime: '20:00–02:00',
    discord: '@nikoscope',
    bio: 'Ищу duo/trio под вечерний прайм. Нужны коллы и норм микро.'
  },
  {
    nickname: 'CalmEntry',
    level: 5,
    age: 18,
    language: 'EN',
    role: 'Entry',
    style: 'Chill',
    playtime: '18:00–23:00',
    discord: '@calmentry',
    bio: 'Play for fun, but no griefing. Looking for non-toxic teammates.'
  }
];

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
