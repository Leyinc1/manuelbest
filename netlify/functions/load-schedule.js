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
    const userId = user.sub; // ID único del usuario

    try {
        // 2. Seleccionar solo los items del usuario actual
        const { rows } = await pool.query('SELECT course_name, day, start_hour, duration FROM schedule_items WHERE user_id = $1', [userId]);
        
        const scheduleItems = rows.map(row => ({
            course: row.course_name,
            day: row.day,
            startHour: row.start_hour,
            duration: row.duration,
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(scheduleItems),
        };
    } catch (error) {
        console.error('Error loading schedule:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'No se pudo cargar el horario.' }) };
    }
};