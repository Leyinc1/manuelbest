// netlify/functions/create-user-entry.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async function(event) {
    // Solo nos interesa el evento de registro exitoso
    if (event.body) {
        const payload = JSON.parse(event.body);
        if (payload.event === 'signup') {
            const { id, email } = payload.user;

            // Basic input validation for id and email
            if (!id || typeof id !== 'string' || id.trim() === '') {
                return { statusCode: 400, body: JSON.stringify({ error: 'ID de usuario inválido.' }) };
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Corrected regex
            if (!email || !emailRegex.test(email)) {
                return { statusCode: 400, body: JSON.stringify({ error: "Formato de email inválido." }) }; // Corrected string
            }

            try {
                const client = await pool.connect();
                try {
                    const query = 'INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING';
                    await client.query(query, [id, email]);
                } finally {
                    client.release();
                }
                
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Usuario registrado en la base de datos.' })
                };

            } catch (error) {
                console.error('Error al registrar usuario en la DB:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: error.message || 'Error interno del servidor.' })
                };
            }
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Evento no procesado.' })
    };
};