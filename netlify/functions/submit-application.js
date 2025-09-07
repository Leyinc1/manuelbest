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

    // Obtiene la función `sql` que se conecta automáticamente a la DB
    // usando la variable de entorno DATABASE_URL.
    const sql = neon();

    // Define y ejecuta la consulta usando "tagged templates".
    // Esto previene inyecciones SQL de forma automática.
    await sql`
      INSERT INTO applications (full_name, email, phone, dia, hora, mensaje)
      VALUES (${data.fullName}, ${data.email}, ${data.phone}, ${data.day}, ${data.time}, ${data.message});
    `;

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
      body: JSON.stringify({ error: 'No se pudo guardar la solicitud.' }),
    };
  }
};
