const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const team = (event.queryStringParameters && event.queryStringParameters.team) ? event.queryStringParameters.team.trim() : null;
  if (!team) return { statusCode: 400, body: JSON.stringify({ error: 'Parámetro team requerido.' }) };

  try {
    const sql = neon();
    const rows = await sql`
      SELECT student_id, full_name, email, is_leader
      FROM members m
      JOIN teams t ON m.team_id = t.id
      WHERE t.name = ${team}
      ORDER BY is_leader DESC, full_name;
    `;

    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (error) {
    console.error('get-members error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Error interno' }) };
  }
};
