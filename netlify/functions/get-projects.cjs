// netlify/functions/get-projects.js

const { Pool } = require('pg');

exports.handler = async function (event, context) {
    const { user } = context.clientContext;
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Acceso no autorizado.' }) };
    }

    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const client = await pool.connect(); // Added client connection

    try {
        // La consulta ahora une `projects` y `project_members`
        const query = `
            SELECT p.* FROM projects p
            JOIN project_members pm ON p.id = pm.project_id
            WHERE pm.user_id = $1
        `;
        const { rows } = await client.query(query, [user.sub]); // Use client.query
        // await pool.end(); // Removed pool.end here, will be in finally

        return {
            statusCode: 200,
            body: JSON.stringify(rows),
        };
    } catch (error) { // Changed catch block
        console.error('Error getting projects:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Failed to get projects.' }),
        };
    } finally { // Added finally block
        client.release();
        await pool.end(); // Ensure pool ends
    }
};