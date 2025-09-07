// netlify/functions/get-projects.js

const { Pool } = require('pg');

exports.handler = async function (event, context) {
    const { user } = context.clientContext;
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Acceso no autorizado.' }) };
    }

    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    
    try {
        // La consulta ahora une `projects` y `project_members`
        const query = `
            SELECT p.* FROM projects p
            JOIN project_members pm ON p.id = pm.project_id
            WHERE pm.user_id = $1
        `;
        const { rows } = await pool.query(query, [user.sub]);
        await pool.end();

        return {
            statusCode: 200,
            body: JSON.stringify(rows),
        };
    } catch (error) {
        // ... manejo de errores ...
    }
};