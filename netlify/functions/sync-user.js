// netlify/functions/sync-user.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async function(event, context) {
    const { user } = context.clientContext;

    // Si no hay un usuario en el contexto, no hay nada que hacer.
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: 'No autenticado.' }) };
    }

    try {
        const { sub: userId, email } = user;
        const client = await pool.connect();
        try {
            // "INSERT ... ON CONFLICT DO NOTHING" es una forma segura y eficiente de insertar
            // un registro solo si no existe. Si el usuario ya está en la tabla, no hará nada.
            const query = 'INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING';
            await client.query(query, [userId, email]);
        } finally {
            client.release();
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Sincronización de usuario completada.' })
        };

    } catch (error) {
        console.error('Error en sync-user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno del servidor.' })
        };
    }
};