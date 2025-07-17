from laion_clap import CLAP_Module
from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
import torchaudio

# Create model
model = CLAP_Module(enable_fusion=False)
model.load_ckpt() # Load pretrained model

app = FastAPI()

@app.post("/embed")
async def embed(file: UploadFile):
    # Read uploaded mp3 file
    contents = await file.read()
    with open("/tmp/input.mp3", "wb") as f:
        f.write(contents)

    # Load waveform, a squence of floats that represent the pressure wave your ears hear
    waveform, sr = torchaudio.load("/tmp/input.mp3")
    if sr != 48000:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=48000) # Resample to 48k Hz
        waveform = resampler(waveform)

    waveform = waveform.mean(dim=0, keepdim=True) # Convert to mono, [1, samples]

    # Convert tensor to numpy array to avoid astype() error in laion_clap
    waveform_np = waveform.numpy()
    embedding = model.get_audio_embedding_from_data(waveform_np) # Pass numpy array instead of tensor
    embedding_list = embedding.squeeze(0).tolist() # [1, D] -> [D]

    return JSONResponse(content={"Embedding": embedding_list})

@app.get("/health")
def health():
    return {"status": "Application healthy"}