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
    if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Nombre completo inválido.' }) };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Corrected regex
    if (!data.email || !emailRegex.test(data.email)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Formato de correo electrónico inválido.' }) };
    }
    const allowedDays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    if (!data.day || !allowedDays.includes(data.day)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Día de la semana inválido.' }) };
    }
    const allowedTimes = ['09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00'];
    if (!data.time || !allowedTimes.includes(data.time)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Hora inválida.' }) };
    }
    if (data.message && typeof data.message !== 'string' || data.message.length > 500) { // Example max length
      return { statusCode: 400, body: JSON.stringify({ error: 'Mensaje demasiado largo.' }) };
    }
    // Phone is optional, no strict validation for now

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
      body: JSON.stringify({ error: error.message || 'No se pudo guardar la solicitud.' }),
    };
  }
};