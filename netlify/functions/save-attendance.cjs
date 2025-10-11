const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    // payload: { type: 'salon'|'team', key: 'D-303' or 'Team Name', records: [{ team, student_id, present }] }
    if (!payload || !payload.records || !Array.isArray(payload.records)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Payload inválido.' }) };
    }

    const sql = neon();

    // Asegúrate de tener una tabla attendance (si no, crearla).
    // Insertamos registros con timestamp
    for (const r of payload.records) {
      await sql`
        INSERT INTO attendance (team_name, student_id, present, salon, recorded_at)
        VALUES (${r.team || null}, ${r.student_id || null}, ${r.present ? 1 : 0}, ${payload.key || null}, NOW());
      `;
    }

    return { statusCode: 200, body: JSON.stringify({ saved: payload.records.length }) };
  } catch (error) {
    console.error('save-attendance error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Error interno' }) };
  }
};
