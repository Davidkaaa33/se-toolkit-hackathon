function attachSession(req, res, next) {
  let sessionId = req.session.playerSessionId;

  if (!sessionId) {
    sessionId = req.cookies?.stack_session_id;
  }

  if (!sessionId) {
    const { v4: uuidv4 } = require('uuid');
    sessionId = uuidv4();
    req.session.playerSessionId = sessionId;
    res.cookie('stack_session_id', sessionId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
  }

  req.sessionId = sessionId;
  next();
}

module.exports = attachSession;
