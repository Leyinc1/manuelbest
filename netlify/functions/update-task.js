const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'PUT') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { id, status, content, assigned_to, description, tags } = JSON.parse(event.body);

        let query = 'UPDATE tasks SET ';
        const values = [];
        let setClauses = [];

        if (status) { values.push(status); setClauses.push(`status = ${values.length}`); }
        if (content) { values.push(content); setClauses.push(`content = ${values.length}`); }
        if (assigned_to !== undefined) { values.push(assigned_to); setClauses.push(`assigned_to = ${values.length}`); }
        if (description !== undefined) { values.push(description); setClauses.push(`description = $${values.length}`); }
        // Añadimos el nuevo campo de etiquetas
        const { id, status, content, assigned_to, description, tags } = JSON.parse(event.body);

        console.log('Received body:', event.body); // Log the raw body
        console.log('Parsed tags:', tags); // Log the parsed tags

        let query = 'UPDATE tasks SET ';
        const values = [];
        let setClauses = [];

        if (status) { values.push(status); setClauses.push(`status = ${values.length}`); }
        if (content) { values.push(content); setClauses.push(`content = ${values.length}`); }
        if (assigned_to !== undefined) { values.push(assigned_to); setClauses.push(`assigned_to = ${values.length}`); }
        if (description !== undefined) { values.push(description); setClauses.push(`description = ${values.length}`); }
        if (tags !== undefined) {
            // For text[] type, pg-node expects a JavaScript array directly
            values.push(tags); // <--- Changed back to direct push
            setClauses.push(`tags = ${values.length}`);
        }

        if (setClauses.length === 0) {
            return { statusCode: 400, body: 'No fields to update' };
        }
        
        query += setClauses.join(', ') + ` WHERE id = ${values.length + 1}`;
        values.push(id);

        console.log('Generated Query:', query);
        console.log('Generated Values:', values);

        await pool.query(query, values);

        if (setClauses.length === 0) {
            return { statusCode: 400, body: 'No fields to update' };
        }
        
        query += setClauses.join(', ') + ` WHERE id = $${values.length + 1}`;
        values.push(id);

        await pool.query(query, values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task updated successfully' }),
        };
    } catch (error) {
        console.error('Error en update-task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update task', details: error.message }),
        };
    }
};