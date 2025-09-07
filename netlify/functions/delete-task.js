// netlify/functions/delete-task.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { id } = event.queryStringParameters;
        if (!id) {
            return { statusCode: 400, body: 'Falta el parámetro "id" en la URL.' };
        }

        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Tarea eliminada correctamente.' }),
        };
    } catch (error) { // <-- ¡LA LLAVE FALTANTE AHORA ESTÁ AQUÍ!
        console.error('Error en delete-task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Fallo al eliminar la tarea.', details: error.message }),
        };
    }
};