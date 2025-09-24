// Importa el helper de Netlify para Neon
const { neon } = require('@netlify/neon');

// El 'handler' es la función principal que Netlify ejecutará
exports.handler = async (event) => {
  // Solo se aceptan solicitudes POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parsea los datos JSON enviados desde el formulario
    const data = JSON.parse(event.body);

    // Input validation for form fields
    if (!data.teamName || typeof data.teamName !== 'string' || data.teamName.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Nombre de equipo inválido.' }) };
    }

    if (!data.members || !Array.isArray(data.members) || data.members.length < 2 || data.members.length > 3) {
      return { statusCode: 400, body: JSON.stringify({ error: 'El equipo debe tener entre 2 y 3 integrantes.' }) };
    }

    for (const member of data.members) {
      if (!member.studentId || typeof member.studentId !== 'string' || member.studentId.trim() === '') {
        return { statusCode: 400, body: JSON.stringify({ error: 'Código de estudiante inválido.' }) };
      }
      if (!member.fullName || typeof member.fullName !== 'string' || member.fullName.trim() === '') {
        return { statusCode: 400, body: JSON.stringify({ error: 'Nombre completo de integrante inválido.' }) };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!member.email || !emailRegex.test(member.email)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Formato de correo electrónico de integrante inválido.' }) };
      }
    }

    if (data.message && (typeof data.message !== 'string' || data.message.length > 1000)) { // Example max length
      return { statusCode: 400, body: JSON.stringify({ error: 'Mensaje demasiado largo.' }) };
    }

    // Obtiene la función `sql` que se conecta automáticamente a la DB
    const sql = neon();

    // Se utiliza una transacción para asegurar que el equipo y sus miembros se creen juntos.
    try {
      // Inicia la transacción
      await sql`BEGIN`;

      // 1. Inserta el equipo en la tabla `teams` y recupera el ID generado.
      const result = await sql`
        INSERT INTO teams (name, message)
        VALUES (${data.teamName}, ${data.message})
        RETURNING id;
      `;
      const teamId = result[0].id;

      // 2. Itera sobre los miembros y los inserta en la tabla `members`.
      for (let i = 0; i < data.members.length; i++) {
        const member = data.members[i];
        const isLeader = (i === 0); // El primer miembro del array se considera el líder.

        await sql`
          INSERT INTO members (team_id, student_id, full_name, email, is_leader)
          VALUES (${teamId}, ${member.studentId}, ${member.fullName}, ${member.email}, ${isLeader});
        `;
      }

      // 3. Si todo ha ido bien, confirma los cambios en la base de datos.
      await sql`COMMIT`;

    } catch (transactionError) {
      // 4. Si ocurre cualquier error durante la transacción, la revierte.
      await sql`ROLLBACK`;
      // Y relanza el error para que sea capturado por el bloque catch principal.
      throw transactionError;
    }

    // Devuelve una respuesta de éxito al frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Equipo inscrito exitosamente' }),
    };

  } catch (error) {
    // En caso de error, lo registra en los logs de Netlify y devuelve un error 500
    console.error('Error al guardar en la base de datos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'No se pudo guardar la solicitud.' }),
    };
  }
};
