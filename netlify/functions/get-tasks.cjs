const { Pool } = require('pg');

// Es una buena práctica inicializar el pool fuera del handler
// para que pueda ser reutilizado en ejecuciones "cálidas" de la función.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Generalmente necesario para conectar a bases de datos en la nube.
    }
});

exports.handler = async function (event, context) {
    try {
        // 1. VERIFICAR AUTENTICACIÓN
        const { user } = context.clientContext;
        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Acceso no autorizado. Por favor, inicia sesión.' }),
            };
        }

        // 2. VERIFICAR QUE EL projectId FUE ENVIADO
        const { projectId } = event.queryStringParameters;
        // Basic input validation for projectId
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            return {
                statusCode: 400, // Bad Request
                body: JSON.stringify({ error: 'ID de proyecto inválido.' }),
            };
        }

        const client = await pool.connect();

        try {
            // 3. VERIFICAR QUE EL USUARIO ES MIEMBRO DEL PROYECTO
            const memberCheckQuery = 'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2';
            const memberResult = await client.query(memberCheckQuery, [projectId, user.sub]);

            if (memberResult.rowCount === 0) {
                return {
                    statusCode: 403, // Forbidden
                    body: JSON.stringify({ error: 'No tienes permiso para ver las tareas de este proyecto.' }),
                };
            }

            // 4. OBTENER LAS TAREAS SI LA VERIFICACIÓN ES EXITOSA
            const tasksQuery = 'SELECT * FROM tasks WHERE project_id = $1';
            const { rows } = await client.query(tasksQuery, [projectId]);
            
            return {
                statusCode: 200,
                body: JSON.stringify(rows),
            };

        } finally {
            // 5. ASEGURARSE DE LIBERAR EL CLIENTE DEL POOL EN CUALQUIER CASO
            client.release();
        }

    } catch (error) {
        console.error('Error en la función get-tasks:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Error interno del servidor al obtener las tareas.' }),
        };
    }
};