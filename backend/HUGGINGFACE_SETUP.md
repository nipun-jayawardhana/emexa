# Hugging Face Model Setup Guide

## ප්‍රශ්නය (Problem)
API key එක තියෙනවා ඒත් "insufficient permissions to call Inference Providers" error එනවා.

## විසඳුම (Solution) - IMPORTANT!

### Option 1: Token Permissions Update කරන්න (Recommended)

1. **Visit Token Settings:**
   - https://huggingface.co/settings/tokens
   - ඔයාගේ token එක click කරන්න (`YOUR_HUGGINGFACE_TOKEN_HERE`)

2. **Enable Required Permission:**
   - Scroll down to permissions
   - ✅ Enable: **"Make calls to Inference Providers"**
   - Save changes

### Option 2: නව Token එකක් Create කරන්න

1. **Create New Token:**
   - https://huggingface.co/settings/tokens
   - Click "New token"
   - Name: `emexa-ai-hints`
   - Permissions:
     - ✅ **Make calls to Inference Providers** (වැදගත්!)
     - ✅ Make calls to serverless Inference API
     - ✅ Read access to contents of repos
   - Click "Generate token"

2. **Copy Token:**
   - Copy the new token (starts with `hf_`)

3. **Update .env File:**
   - Open: `backend/.env`
   - Update line:
   ```
   HF_API_KEY=YOUR_NEW_TOKEN_HERE
   ```

### Step 2: Settings Tab එකට යන්න (Screenshot Reference)

Your screenshot shows "Overview" and "Settings" tabs. Click **"Settings"** tab:
- Settings tab එකේ enable කරන්න ඕන providers
- Default providers list එක show වෙයි

### Step 4: Test API Access
Run this test command:
\`\`\`bash
cd backend
node test-hf-api.js
\`\`\`

## Recommended Models (Free & Working)

### Text Generation Models:
1. **mistralai/Mistral-7B-Instruct-v0.2** (Best quality, need to accept terms)
2. **mistralai/Mixtral-8x7B-Instruct-v0.1** (Better quality, need to accept terms)
3. **google/flan-t5-large** (Good quality, free)
4. **meta-llama/Llama-2-7b-chat-hf** (Need Meta approval)

### How to Change Model:
Open: `backend/src/controllers/hintController.js`

Find this line:
\`\`\`javascript
model: 'gpt2',  // මෙතන model name එක වෙනස් කරන්න පුළුවන්
\`\`\`

Change to:
\`\`\`javascript
model: 'mistralai/Mistral-7B-Instruct-v0.2',  // Terms accept කරලා නම්
\`\`\`

## Common Errors & Solutions

### Error: "insufficient permissions"
**Fix:** Go to https://hf.co/settings/inference-providers and enable at least one provider

### Error: "No Inference Provider available"
**Fix:** 
1. Enable "Hugging Face" provider at https://hf.co/settings/inference-providers
2. Make sure your token has "Inference API" permission

### Error: "Model requires authorization"
**Fix:** Visit the model page and click "Agree and access repository"

## Testing Steps (After Setup):

1. **Enable Inference Provider:**
   - https://hf.co/settings/inference-providers → Enable "Hugging Face"

2. **Test API:**
   \`\`\`bash
   cd backend
   node test-hf-api.js
   \`\`\`

3. **If test passes, restart backend:**
   \`\`\`bash
   node server.js
   \`\`\`

4. **Test hint generation:**
   - Open quiz in browser
   - Allow camera permission
   - Click hint bulb (💡)
   - Check backend terminal for "✅ HF API raw response"

## Current Configuration:
- API Key: `YOUR_HUGGINGFACE_TOKEN_HERE` ✅
- Model: `gpt2` (currently trying, but needs provider enabled)
- Endpoint: `/api/hint`
- Caching: Local Storage (hints saved per question)

## Next Steps:
1. ✅ API key දැනටමත් .env file එකේ තියෙනවා
2. 🔴 **Inference Provider enable කරන්න ඕන** → https://hf.co/settings/inference-providers
3. 🔴 Test කරන්න: `node test-hf-api.js`
4. ✅ Working නම් backend restart කරන්න
