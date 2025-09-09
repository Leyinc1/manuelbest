const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { user } = context.clientContext; // Get user from context
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Acceso no autorizado.' }) };
    }

    try {
        const { id } = event.queryStringParameters;
        // Basic input validation for id
        if (!id || typeof id !== 'string' || id.trim() === '') {
            return { statusCode: 400, body: JSON.stringify({ error: 'ID de proyecto inválido.' }) };
        }

        // Authorization check: Verify user is the owner of the project
        const ownerCheckQuery = 'SELECT owner_id FROM projects WHERE id = $1';
        const ownerResult = await pool.query(ownerCheckQuery, [id]);
        if (ownerResult.rowCount === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Proyecto no encontrado.' }) };
        }
        if (ownerResult.rows[0].owner_id !== user.sub) {
            return { statusCode: 403, body: JSON.stringify({ error: 'No tienes permiso para eliminar este proyecto.' }) };
        }

        // Gracias a ON DELETE CASCADE, esto también eliminará todas las tareas asociadas.
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Proyecto eliminado correctamente.' }),
        };
    } catch (error) {
        console.error('Error en delete-project:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Fallo al eliminar el proyecto.' }) };
    }
};