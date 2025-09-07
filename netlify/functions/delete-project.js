const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { id } = event.queryStringParameters;
        if (!id) {
            return { statusCode: 400, body: 'Falta el parámetro "id" del proyecto.' };
        }

        // Gracias a ON DELETE CASCADE, esto también eliminará todas las tareas asociadas.
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Proyecto eliminado correctamente.' }),
        };
    } catch (error) {
        console.error('Error en delete-project:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Fallo al eliminar el proyecto.' }),
        };
    }
};