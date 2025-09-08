const { Pool } = require('pg');

exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
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
      const { title, start, end } = item;
      const day = new Date(start).getDay();
      const start_hour = new Date(start).getHours();
      const duration = (new Date(end) - new Date(start)) / (1000 * 60 * 60);

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
