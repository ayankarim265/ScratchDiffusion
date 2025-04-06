import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface GenerateImageParams {
  prompt: string;
  uncond_prompt?: string;
  strength?: number;
  do_cfg?: boolean;
  cfg_scale?: number;
  sampler_name?: string;
  n_inference_steps?: number;
  seed?: number;
}

export const generateImage = async (params: GenerateImageParams) => {
  try {
    const response = await axios.post(`${API_URL}/generate`, params);
    return response.data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}; 