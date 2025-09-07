// netlify/functions/create-project.js

const { Pool } = require('pg');

exports.handler = async function (event, context) {
    const { user } = context.clientContext;
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Acceso no autorizado.' }) };
    }

    const { name } = JSON.parse(event.body);
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Iniciar transacción

        // 1. Insertar el nuevo proyecto y designar al usuario actual como dueño
        const projectQuery = 'INSERT INTO projects (name, owner_id) VALUES ($1, $2) RETURNING *';
        const projectResult = await client.query(projectQuery, [name, user.sub]);
        const newProject = projectResult.rows[0];

        // 2. Añadir al creador como el primer miembro en la tabla `project_members`
        const memberQuery = 'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)';
        await client.query(memberQuery, [newProject.id, user.sub]);

        await client.query('COMMIT'); // Confirmar transacción

        return {
            statusCode: 200,
            body: JSON.stringify(newProject),
        };
    } catch (error) {
        await client.query('ROLLBACK'); // Revertir en caso de error
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Falló la creación del proyecto.' }) };
    } finally {
        client.release();
        await pool.end();
    }
};