const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    try {
        const { content, status, projectId, assignedTo, description, tags } = JSON.parse(event.body);
        const result = await pool.query(
            'INSERT INTO tasks (content, status, project_id, assigned_to, description, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [content, status, projectId, assignedTo, description, tags]
        );
        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0]),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create task' }),
        };
    }
};