/**
 * API service for communicating with the Stable Diffusion backend
 */

const API_URL = 'http://localhost:5000';

export const generateImage = async (params) => {
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}; 