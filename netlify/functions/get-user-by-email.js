const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);
  const { identity } = context.clientContext;

  if (!email) {
    return { statusCode: 400, body: 'Email is required' };
  }

  const { url, token } = identity;

  try {
    const response = await fetch(`${url}/admin/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { statusCode: response.status, body: `Failed to fetch users: ${errorBody}` };
    }

    const { users } = await response.json();
    const targetUser = users.find(u => u.email === email);

    if (targetUser) {
      return {
        statusCode: 200,
        body: JSON.stringify(targetUser),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }
  } catch (error) {
    return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
  }
};