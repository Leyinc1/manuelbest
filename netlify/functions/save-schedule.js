const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
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
    user = jwt.decode(token);
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }

  const { schedule } = JSON.parse(event.body);
  const user_id = user.sub;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM schedule_items WHERE user_id = $1', [user_id]);

    for (const item of schedule) {
      console.log('Processing item:', item);
      const { title, start, end } = item;

      if (!start || !end) {
        console.error('Invalid start or end date for item:', item);
        continue;
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Invalid date for item:', item);
        continue;
      }

      const day = startDate.getDay();
      const start_hour = startDate.getHours();
      const duration = (endDate - startDate) / (1000 * 60 * 60);

      await client.query(
        'INSERT INTO schedule_items (course_name, day, start_hour, duration, user_id) VALUES ($1, $2, $3, $4, $5)',
        [title, day, start_hour, duration, user_id]
      );
    }

    await client.query('COMMIT');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Schedule saved successfully' }),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving schedule:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save schedule' }),
    };
  } finally {
    client.release();
  }
};