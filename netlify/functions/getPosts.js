import { fetchPosts } from './wpService';

export async function handler() {
  try {
    const data = await fetchPosts();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}