 
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const { authorization } = event.headers;
  if (!authorization) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const token = authorization.split(' ')[1];
  let user;
  try {
    // Verify the token signature using a secret key
    user = jwt.verify(token, process.env.JWT_SECRET); // CRITICAL CHANGE: verify instead of decode
  } catch (error) {
    console.error('JWT Verification Error:', error); // Log verification error
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid or expired token' }), // More specific error
    };
  }

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }

  const user_id = user.sub;
  // Basic input validation for user_id
  if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
    return { statusCode: 400, body: JSON.stringify({ error: 'ID de usuario inválido.' }) };
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    const result = await client.query('SELECT * FROM schedule_items WHERE user_id = $1', [user_id]);
    const schedule = result.rows.map(item => {
      const start = new Date();
      start.setHours(item.start_hour, 0, 0, 0);
      start.setDate(start.getDate() - start.getDay() + item.day);

      const end = new Date(start);
      end.setHours(end.getHours() + item.duration);

      return {
        title: item.course_name,
        start,
        end,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ schedule }),
    };
  } catch (error) {
    console.error('Error loading schedule:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to save schedule' }),
    };
  } finally {
    client.release();
  }
};