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
    // usando la variable de entorno DATABASE_URL.
    const sql = neon();

    // Itera sobre los miembros y los inserta en la base de datos.
    // Se asume que la tabla `applications` ahora almacenará registros de miembros.
    for (const member of data.members) {
      await sql`
        INSERT INTO applications (full_name, email, phone, mensaje)
        VALUES (${member.fullName}, ${member.email}, ${member.studentId}, ${`Equipo: ${data.teamName}. Mensaje: ${data.message}`});
      `;
    }

    // Devuelve una respuesta de éxito al frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Solicitud guardada exitosamente' }),
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
