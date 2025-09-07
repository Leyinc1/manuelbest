const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

exports.handler = async (event, context) => {
    // 1. Verificar que el usuario esté autenticado
    const { user } = context.clientContext;
    if (!user) {
        return { statusCode: 401, body: 'Acceso no autorizado' };
    }
    const userId = user.sub; // ID único del usuario de Netlify Identity

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const scheduleItems = JSON.parse(event.body);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 2. Borrar solo los items del usuario actual
            await client.query('DELETE FROM schedule_items WHERE user_id = $1', [userId]);

            // 3. Insertar los nuevos items con el ID del usuario
            for (const item of scheduleItems) {
                const query = `
                    INSERT INTO schedule_items (course_name, day, start_hour, duration, user_id)
                    VALUES ($1, $2, $3, $4, $5)
                `;
                await client.query(query, [item.course, parseInt(item.day), parseInt(item.startHour), parseInt(item.duration), userId]);
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Horario guardado con éxito.' }),
        };
    } catch (error) {
        console.error('Error saving schedule:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'No se pudo guardar el horario.' }) };
    }
};