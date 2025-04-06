import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Slider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Switch,
  Container,
  Stack,
  Paper,
  CircularProgress,
  Grid,
} from '@mui/material';
import { generateImage, GenerateImageParams } from './services/api';
import { Snackbar, Alert } from '@mui/material';

function App() {
  const [prompt, setPrompt] = useState('');
  const [uncondPrompt, setUncondPrompt] = useState('');
  const [strength, setStrength] = useState(0.9);
  const [doCfg, setDoCfg] = useState(true);
  const [cfgScale, setCfgScale] = useState(8);
  const [sampler, setSampler] = useState('ddpm');
  const [steps, setSteps] = useState(50);
  const [seed, setSeed] = useState(42);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const params: GenerateImageParams = {
        prompt,
        uncond_prompt: uncondPrompt,
        strength,
        do_cfg: doCfg,
        cfg_scale: cfgScale,
        sampler_name: sampler,
        n_inference_steps: steps,
        seed,
      };

      const result = await generateImage(params);
      setGeneratedImage(result.image);
      setSnackbar({
        open: true,
        message: 'Image generated successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate image. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Stable Diffusion Image Generator
        </Typography>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Prompt"
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              variant="outlined"
            />

            <TextField
              label="Negative Prompt (Optional)"
              fullWidth
              value={uncondPrompt}
              onChange={(e) => setUncondPrompt(e.target.value)}
              placeholder="Enter negative prompt here..."
              variant="outlined"
            />

            <Box>
              <Typography gutterBottom>
                Strength: {strength}
              </Typography>
              <Slider
                value={strength}
                onChange={(_, value) => setStrength(value as number)}
                min={0}
                max={1}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={doCfg}
                  onChange={(e) => setDoCfg(e.target.checked)}
                />
              }
              label="Enable CFG"
            />

            {doCfg && (
              <Box>
                <Typography gutterBottom>
                  CFG Scale: {cfgScale}
                </Typography>
                <Slider
                  value={cfgScale}
                  onChange={(_, value) => setCfgScale(value as number)}
                  min={1}
                  max={20}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}

            <TextField
              label="Sampler"
              fullWidth
              value={sampler}
              onChange={(e) => setSampler(e.target.value)}
              variant="outlined"
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Steps"
                  type="number"
                  fullWidth
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Seed"
                  type="number"
                  fullWidth
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerate}
              disabled={loading}
              fullWidth
              size="large"
              startIcon={loading && <CircularProgress size={24} color="inherit" />}
            >
              {loading ? 'Generating...' : 'Generate Image'}
            </Button>
          </Stack>
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', py: 4 }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 2 }}>Generating your image...</Typography>
          </Box>
        )}

        {generatedImage && !loading && (
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={generatedImage} 
              alt="Generated" 
              style={{ 
                maxWidth: '100%', 
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }} 
            />
          </Box>
        )}
      </Stack>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App; 