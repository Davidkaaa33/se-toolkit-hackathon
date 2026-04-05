const express = require('express');
const router = express.Router();
const db = require('../db/pool');

// GET /api/players - Get all players (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { language, role, style, level_min, level_max, age_min, age_max, sort, own_only, session_id } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (language && language !== 'all') {
      conditions.push(`language = $${paramIndex}`);
      params.push(language);
      paramIndex++;
    }

    if (role && role !== 'all') {
      conditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (style && style !== 'all') {
      conditions.push(`style = $${paramIndex}`);
      params.push(style);
      paramIndex++;
    }

    if (level_min) {
      conditions.push(`level >= $${paramIndex}`);
      params.push(Number(level_min));
      paramIndex++;
    }

    if (level_max) {
      conditions.push(`level <= $${paramIndex}`);
      params.push(Number(level_max));
      paramIndex++;
    }

    if (age_min) {
      conditions.push(`age >= $${paramIndex}`);
      params.push(Number(age_min));
      paramIndex++;
    }

    if (age_max) {
      conditions.push(`age <= $${paramIndex}`);
      params.push(Number(age_max));
      paramIndex++;
    }

    if (own_only === 'true' && session_id) {
      conditions.push(`session_id = $${paramIndex}`);
      params.push(session_id);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'created_at DESC';
    if (sort === 'age-desc') orderBy = 'age DESC';
    else if (sort === 'age-asc') orderBy = 'age ASC';
    else if (sort === 'level-desc') orderBy = 'level DESC';
    else if (sort === 'level-asc') orderBy = 'level ASC';

    const query = `SELECT * FROM players ${whereClause} ORDER BY ${orderBy}`;
    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching players:', error.message);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// GET /api/players/:id - Get single player
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM players WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching player:', error.message);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// POST /api/players - Create new player
router.post('/', async (req, res) => {
  try {
    const { nickname, level, age, language, role, style, playtime, discord, bio } = req.body;
    const sessionId = req.sessionId;

    // Validation
    if (!nickname || !level || !age || !language || !style || !discord) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const levelNum = Number(level);
    const ageNum = Number(age);

    if (levelNum < 0 || levelNum > 10) {
      return res.status(400).json({ error: 'Level must be between 0 and 10' });
    }

    if (ageNum < 0 || ageNum > 99) {
      return res.status(400).json({ error: 'Age must be between 0 and 99' });
    }

    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();

    const result = await db.query(
      `INSERT INTO players (id, nickname, level, age, language, role, style, playtime, discord, bio, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [id, nickname, levelNum, ageNum, language, role || 'Any', style, playtime, discord, bio || null, sessionId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating player:', error.message);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// PUT /api/players/:id - Update player
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, level, age, language, role, style, playtime, discord, bio } = req.body;
    const sessionId = req.sessionId;

    // Check ownership
    const existing = await db.query('SELECT * FROM players WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (existing.rows[0].session_id !== sessionId) {
      return res.status(403).json({ error: 'Not authorized to edit this profile' });
    }

    const result = await db.query(
      `UPDATE players
       SET nickname = $1, level = $2, age = $3, language = $4, role = $5, style = $6, playtime = $7, discord = $8, bio = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [nickname, Number(level), Number(age), language, role || 'Any', style, playtime, discord, bio || null, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating player:', error.message);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE /api/players/:id - Delete player
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.sessionId;

    // Check ownership
    const existing = await db.query('SELECT * FROM players WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (existing.rows[0].session_id !== sessionId) {
      return res.status(403).json({ error: 'Not authorized to delete this profile' });
    }

    await db.query('DELETE FROM players WHERE id = $1', [id]);

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error.message);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

// DELETE /api/players/session/all - Delete all players for current session
router.delete('/session/all', async (req, res) => {
  try {
    const sessionId = req.sessionId;

    const result = await db.query('DELETE FROM players WHERE session_id = $1', [sessionId]);

    res.json({ message: `Deleted ${result.rowCount} profile(s)`, deletedCount: result.rowCount });
  } catch (error) {
    console.error('Error deleting session players:', error.message);
    res.status(500).json({ error: 'Failed to delete profiles' });
  }
});

module.exports = router;
