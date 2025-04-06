import { useState, useRef } from 'react'
import './App.css'
import { generateImage } from './services/api'

// Icons
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const PromptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

function App() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [strength, setStrength] = useState(0.75)
  const [doCfg, setDoCfg] = useState(true)
  const [cfgScale, setCfgScale] = useState(8)
  const [sampler, setSampler] = useState('ddpm')
  const [steps, setSteps] = useState(50)
  const [seed, setSeed] = useState(42)
  const [useRandomSeed, setUseRandomSeed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)
  const [imageInfo, setImageInfo] = useState(null)
  
  // Image-to-image state
  const [sourceImage, setSourceImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSourceImage(reader.result)
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSourceImage(null)
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        prompt,
        uncond_prompt: negativePrompt,
        strength,
        do_cfg: doCfg,
        cfg_scale: cfgScale,
        sampler_name: sampler,
        n_inference_steps: steps,
        seed: useRandomSeed ? -1 : seed,
        source_image: sourceImage
      }
      
      const result = await generateImage(params)
      setGeneratedImage(result.image)
      
      // Update seed if it was randomly generated on the server
      if (result.seed && result.seed !== seed) {
        setSeed(result.seed)
      }
      
      // Set additional image info if available
      setImageInfo({
        prompt: result.prompt,
        seed: result.seed,
        note: result.note,
        path: result.path
      })
    } catch (err) {
      setError('Failed to generate image. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000))
  }

  return (
    <div className="app-container">
      <header>
        <h1>Stable Diffusion AI</h1>
        <p className="sub-heading">Generate amazing images with AI</p>
      </header>

      <div className="main-content">
        <div className="control-panel">
          <div className="panel-section">
            <h2><PromptIcon /> Prompt</h2>
            <div className="form-group">
              <label htmlFor="prompt">What would you like to generate?</label>
              <textarea 
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A Studio Ghibli style landscape with a castle, 4k, highly detailed..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="negative-prompt">Negative Prompt (things to avoid)</label>
              <textarea 
                id="negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="low quality, blurry, distorted, deformed..."
              />
            </div>
          </div>

          <div className="panel-section">
            <h2><ImageIcon /> Source Image</h2>
            <div className="form-group">
              <label>Upload an image to transform (optional)</label>
              <div className="image-upload-container">
                {previewImage ? (
                  <div className="preview-container">
                    <img src={previewImage} alt="Source" className="preview-image" />
                    <button className="remove-image-btn" onClick={handleRemoveImage}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                    <UploadIcon />
                    <p>Click to upload an image</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="file-input"
                    />
                  </div>
                )}
              </div>
              {sourceImage && (
                <div className="form-group">
                  <label htmlFor="strength">Transformation Strength: <span className="param-value">{strength}</span></label>
                  <p className="param-description">Higher values retain less of the original image (0.75 recommended for style transfer)</p>
                  <input 
                    type="range" 
                    id="strength"
                    min="0.1" 
                    max="1" 
                    step="0.05"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="panel-section">
            <h2><SettingsIcon /> Parameters</h2>
            
            <div className="form-group">
              {!sourceImage && (
                <div className="form-group">
                  <label htmlFor="strength">Strength: <span className="param-value">{strength}</span></label>
                  <input 
                    type="range" 
                    id="strength"
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                  />
                </div>
              )}

              <div className="form-group checkbox">
                <input 
                  type="checkbox" 
                  id="do-cfg"
                  checked={doCfg}
                  onChange={(e) => setDoCfg(e.target.checked)}
                />
                <label htmlFor="do-cfg">Enable Classifier-Free Guidance</label>
              </div>

              {doCfg && (
                <div className="form-group">
                  <label htmlFor="cfg-scale">CFG Scale: <span className="param-value">{cfgScale}</span></label>
                  <input 
                    type="range" 
                    id="cfg-scale"
                    min="1" 
                    max="20" 
                    step="1"
                    value={cfgScale}
                    onChange={(e) => setCfgScale(parseInt(e.target.value))}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="sampler">Sampling Method</label>
                <select 
                  id="sampler"
                  value={sampler}
                  onChange={(e) => setSampler(e.target.value)}
                >
                  <option value="ddpm">DDPM</option>
                  <option value="ddim">DDIM</option>
                  <option value="pndm">PNDM</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="steps">Steps: <span className="param-value">{steps}</span></label>
                  <input 
                    type="number" 
                    id="steps"
                    min="1" 
                    max="100"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group half seed-control">
                  <label htmlFor="seed">Seed</label>
                  <div className="seed-input-container">
                    <input 
                      type="number" 
                      id="seed"
                      min="0"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value))}
                      disabled={useRandomSeed}
                    />
                    <button 
                      className="random-seed-btn" 
                      onClick={handleRandomSeed}
                      title="Generate random seed"
                      disabled={useRandomSeed}
                    >
                      🎲
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox" 
                  id="use-random-seed"
                  checked={useRandomSeed}
                  onChange={(e) => setUseRandomSeed(e.target.checked)}
                />
                <label htmlFor="use-random-seed">Use random seed for each generation</label>
              </div>
            </div>
          </div>

          <button 
            className="generate-btn" 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', margin: 0 }} />
                Generating...
              </>
            ) : (
              <>
                <SparkleIcon />
                {sourceImage ? 'Transform Image' : 'Generate Image'}
              </>
            )}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="image-display">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Creating your masterpiece...</p>
            </div>
          ) : generatedImage ? (
            <div className="image-container">
              <img src={generatedImage} alt="Generated" />
              {imageInfo && (
                <div className="image-info">
                  <p><strong>Prompt:</strong> {imageInfo.prompt}</p>
                  <p><strong>Seed:</strong> <span className="param-value">{imageInfo.seed}</span></p>
                  {imageInfo.note && <p className="note">{imageInfo.note}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="placeholder">
              <ImageIcon />
              <p>Your AI-generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
