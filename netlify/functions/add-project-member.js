// netlify/functions/add-project-member.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async function (event, context) {
    // 1. Verificar que el que invita está autenticado
    const { user: inviter } = context.clientContext;
    if (!inviter) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Acceso no autorizado.' }) };
    }

    const { projectId, newUserEmail } = JSON.parse(event.body);

    // Basic input validation
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
        return { statusCode: 400, body: JSON.stringify({ error: 'ID de proyecto inválido.' }) };
    }
    // Simple email regex for basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUserEmail || !emailRegex.test(newUserEmail)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Formato de email inválido.' }) };
    }

    // No permitir que alguien se invite a sí mismo
    if (inviter.email === newUserEmail) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No puedes invitarte a ti mismo.' }) };
    }

    const client = await pool.connect();

    try {
        // 2. Verificar que el que invita es miembro del proyecto
        const memberCheckQuery = 'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2';
        const memberResult = await client.query(memberCheckQuery, [projectId, inviter.sub]);
        if (memberResult.rowCount === 0) {
            return { statusCode: 403, body: JSON.stringify({ error: 'No tienes permiso para invitar a este proyecto.' }) };
        }

        // 3. Buscar el ID del usuario invitado en nuestra tabla `users` usando su email
        const userSearchQuery = 'SELECT id FROM users WHERE email = $1';
        const userSearchResult = await client.query(userSearchQuery, [newUserEmail]);
        if (userSearchResult.rowCount === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'El usuario con ese email no existe. Pídele que se registre primero.' }) };
        }
        const invitedUserId = userSearchResult.rows[0].id;

        // 4. Insertar la nueva membresía en `project_members`
        const insertMemberQuery = 'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)';
        await client.query(insertMemberQuery, [projectId, invitedUserId]);
        
        return { statusCode: 200, body: JSON.stringify({ message: 'Miembro añadido exitosamente.' }) };

    } catch (error) {
        console.error('Error al añadir miembro:', error);
        if (error.code === '23505') { // Código de error para violación de llave única en PostgreSQL
            return { statusCode: 409, body: JSON.stringify({ error: 'Este usuario ya es miembro del proyecto.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'No se pudo añadir al miembro.' }) };
    } finally {
        client.release();
    }
};