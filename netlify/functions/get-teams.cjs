const { neon } = require('@netlify/neon')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const sql = neon()
    // Consulta equipos y sus miembros
    const teams = await sql`
      SELECT t.id, t.name, t.message,
        json_agg(json_build_object(
          'studentId', m.student_id,
          'fullName', m.full_name,
          'email', m.email,
          'isLeader', m.is_leader
        )) AS members
      FROM teams t
      LEFT JOIN members m ON m.team_id = t.id
      GROUP BY t.id
      ORDER BY t.id DESC;
    `
    return {
      statusCode: 200,
      body: JSON.stringify(teams),
    }
  } catch (error) {
    console.error('Error fetching teams:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Error interno del servidor.' }),
    }
  }
}
