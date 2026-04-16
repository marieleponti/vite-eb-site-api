import { createPost } from './wpService';

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    const data = await createPost(body);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify(error.response?.data || error.message),
    };
  }
}