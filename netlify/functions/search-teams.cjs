const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const q = (event.queryStringParameters && event.queryStringParameters.q) ? event.queryStringParameters.q.trim() : '';

  try {
    const sql = neon();
    if (!q) {
      // devolver los últimos 20 equipos por nombre
      const rows = await sql`SELECT id, name FROM teams ORDER BY name LIMIT 20;`;
      return { statusCode: 200, body: JSON.stringify(rows) };
    }

    const rows = await sql`
      SELECT id, name
      FROM teams
      WHERE name ILIKE ${'%' + q + '%'}
      ORDER BY name
      LIMIT 50;
    `;

    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (error) {
    console.error('search-teams error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Error interno' }) };
  }
};
