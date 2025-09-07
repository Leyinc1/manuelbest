// netlify/functions/delete-task.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 1. VERIFICAR AUTENTICACIÓN
    const { user } = context.clientContext;
    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Acceso no autorizado. Por favor, inicia sesión.' }),
        };
    }

    const client = await pool.connect();

    try {
        const { id } = event.queryStringParameters;
        if (!id) {
            return { statusCode: 400, body: 'Falta el parámetro "id" en la URL.' };
        }

        // 2. OBTENER EL project_id DE LA TAREA
        const taskQuery = await client.query('SELECT project_id FROM tasks WHERE id = $1', [id]);
        if (taskQuery.rowCount === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'La tarea no existe.' }) };
        }
        const { project_id } = taskQuery.rows[0];

        // 3. VERIFICAR QUE EL USUARIO ES MIEMBRO DEL PROYECTO
        const memberCheckQuery = 'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2';
        const memberResult = await client.query(memberCheckQuery, [project_id, user.sub]);

        if (memberResult.rowCount === 0) {
            return {
                statusCode: 403, // Forbidden
                body: JSON.stringify({ error: 'No tienes permiso para eliminar tareas de este proyecto.' }),
            };
        }

        // 4. ELIMINAR LA TAREA
        await client.query('DELETE FROM tasks WHERE id = $1', [id]);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Tarea eliminada correctamente.' }),
        };
    } catch (error) {
        console.error('Error en delete-task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Fallo al eliminar la tarea.', details: error.message }),
        };
    } finally {
        client.release();
    }
};