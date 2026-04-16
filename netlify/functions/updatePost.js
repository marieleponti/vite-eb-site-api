import { updatePost } from './wpService';

export async function handler(event) {
  try {
    const { id, ...body } = JSON.parse(event.body);

    const data = await updatePost(id, body);

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