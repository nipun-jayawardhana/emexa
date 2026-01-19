import { HfInference } from '@huggingface/inference';

let hfClient = null;

export const getHfClient = () => {
  if (!hfClient && process.env.HF_API_KEY && process.env.HF_API_KEY !== 'hf_dummy_key_for_testing') {
    hfClient = new HfInference(process.env.HF_API_KEY.trim());
    console.log('🤖 HfInference client initialized with API key');
  }
  return hfClient;
};
