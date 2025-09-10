const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'PUT') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { user } = context.clientContext; // Get user from context
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Acceso no autorizado. Por favor, inicia sesión.' }) };
    }

    const client = await pool.connect(); // Connect client

    try {
        const { id, status, content, assigned_to, description, tags } = JSON.parse(event.body);

        // Input validation for id
        if (!id || typeof id !== 'string' || id.trim() === '') {
            return { statusCode: 400, body: JSON.stringify({ error: 'ID de tarea inválido.' }) };
        }

        // Authorization check: Get project_id from task and verify user is a member
        const taskQuery = await client.query('SELECT project_id FROM tasks WHERE id = $1', [id]);
        if (taskQuery.rowCount === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'La tarea no existe.' }) };
        }
        const { project_id } = taskQuery.rows[0];

        const memberCheckQuery = 'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2';
        const memberResult = await client.query(memberCheckQuery, [project_id, user.sub]);
        if (memberResult.rowCount === 0) {
            return { statusCode: 403, body: JSON.stringify({ error: 'No tienes permiso para actualizar tareas de este proyecto.' }) };
        }

        // Build dynamic update query
        let query = 'UPDATE tasks SET ';
        const values = [];
        let setClauses = [];

        // Input validation and building setClauses
        if (status !== undefined) {
            const allowedStatuses = ['todo', 'in-progress', 'done', 'requerimientos', 'testing'];
            if (!allowedStatuses.includes(status)) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Estado de tarea inválido.' }) };
            }
            values.push(status); setClauses.push(`status = $${values.length}`);
        }
        if (content !== undefined) {
            if (typeof content !== 'string' || content.trim() === '') {
                return { statusCode: 400, body: JSON.stringify({ error: 'Contenido de tarea inválido.' }) };
            }
            values.push(content); setClauses.push(`content = $${values.length}`);
        }
        if (assigned_to !== undefined) {
            // Assuming assigned_to can be null or a valid user ID string
            if (assigned_to !== null && (typeof assigned_to !== 'string' || assigned_to.trim() === '')) {
                return { statusCode: 400, body: JSON.stringify({ error: 'ID de asignado inválido.' }) };
            }
            values.push(assigned_to); setClauses.push(`assigned_to = $${values.length}`);
        }
        if (description !== undefined) {
            if (typeof description !== 'string') { // Description can be empty string
                return { statusCode: 400, body: JSON.stringify({ error: 'Descripción de tarea inválida.' }) };
            }
            values.push(description); setClauses.push(`description = $${values.length}`);
        }
        
        if (tags !== undefined) {
            if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Formato de etiquetas inválido.' }) };
            }
            const tagsValue = (tags.length === 0) ? null : tags;
            values.push(tagsValue);
            setClauses.push(`tags = $${values.length}`);
        }

        if (setClauses.length === 0) {
            return { statusCode: 400, body: 'No fields to update' };
        }
        
        query += setClauses.join(', ') + ` WHERE id = $${values.length + 1}`;
        values.push(id);

        await client.query(query, values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task updated successfully' }),
        };
    } catch (error) {
        console.error('Error en update-task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Fallo al actualizar la tarea.', details: error.message }),
        };
    } finally {
        client.release();
    }
};