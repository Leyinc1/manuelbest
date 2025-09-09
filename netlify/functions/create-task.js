const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const client = await pool.connect();

    try {
        const { content, status, projectId, assignedTo, description, tags } = JSON.parse(event.body);

        // Input validation for content and status
        if (!content || typeof content !== 'string' || content.trim() === '') {
            return { statusCode: 400, body: JSON.stringify({ error: 'El contenido de la tarea no puede estar vacío.' }) };
        }
        const allowedStatuses = ['todo', 'in-progress', 'done']; // Example allowed statuses
        if (!status || !allowedStatuses.includes(status)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Estado de tarea inválido.' }) };
        }

        const result = await client.query(
            'INSERT INTO tasks (content, status, project_id, assigned_to, description, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [content, status, projectId, assignedTo, description, tags]
        );
        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0]),
        };
    } catch (error) {
        console.error('Error creating task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Failed to create task' }),
        };
    } finally {
        client.release();
    }
};