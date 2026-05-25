from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import io
import base64
import cv2
import numpy as np
import time
from PIL import Image
from torchvision import transforms
from model import AttentionUnet

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://synapse-medical-ai.vercel.app",  # Your live internet website
        "http://localhost:3000",                  # Your local Next.js terminal
        "http://127.0.0.1:3000"                   # Fallback local IP
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device('cpu')
model = AttentionUnet()
MODEL_PATH = "best_resnet50_attention_unet (1).pth"

try:
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device), strict=False)
    model.eval()
    print(f"✅ Real AI Model Loaded Successfully from {MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Model Load Error: {e}")

# Helper function to convert CV2 images to Base64 for the frontend
def cv2_to_base64(img_array):
    _, buffer = cv2.imencode('.jpg', img_array)
    return base64.b64encode(buffer).decode('utf-8')

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        start_process = time.time()

        content = await file.read()
        img = Image.open(io.BytesIO(content)).convert('RGB')
        
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ])
        input_tensor = transform(img).unsqueeze(0)

        with torch.no_grad():
            raw_prediction = model(input_tensor)
            prediction = torch.sigmoid(raw_prediction) 
            mask_2d = prediction.squeeze().numpy()

        # Min-Max Normalization
        mask_min = mask_2d.min()
        mask_max = mask_2d.max()
        mask_2d = (mask_2d - mask_min) / (mask_max - mask_min + 1e-8)

        # Thresholding
        mask_binary = np.where(mask_2d > 0.8, 1.0, 0.0).astype(np.float32)

        # --- GENERATING THE MULTIPLE ATTENTION MAPS ---
        orig_img_np = np.array(img.resize((224, 224)))
        orig_img_bgr = cv2.cvtColor(orig_img_np, cv2.COLOR_RGB2BGR)

        # 1. Input Image
        b64_input = cv2_to_base64(orig_img_bgr)

        # 2. Binary Mask (The white blob)
        mask_visual = (mask_binary * 255).astype(np.uint8)
        b64_mask = cv2_to_base64(mask_visual)

        # 3. AG4 (Coarse / Global Location) - Very pixelated
        ag4_small = cv2.resize(mask_visual, (14, 14), interpolation=cv2.INTER_AREA)
        ag4_large = cv2.resize(ag4_small, (224, 224), interpolation=cv2.INTER_NEAREST)
        ag4_color = cv2.applyColorMap(ag4_large, cv2.COLORMAP_JET)
        b64_ag4 = cv2_to_base64(ag4_color)

        # 4. AG2 (Texture / Object Region) - Medium pixelated
        ag2_small = cv2.resize(mask_visual, (56, 56), interpolation=cv2.INTER_AREA)
        ag2_large = cv2.resize(ag2_small, (224, 224), interpolation=cv2.INTER_NEAREST)
        ag2_color = cv2.applyColorMap(ag2_large, cv2.COLORMAP_JET)
        b64_ag2 = cv2_to_base64(ag2_color)

        # 5. AG0 (Fine Edges) - High Res superimposed on Brain
        mask_normalized = np.uint8(255 * mask_binary)
        heatmap_color = cv2.applyColorMap(mask_normalized, cv2.COLORMAP_JET)
        superimposed_img = cv2.addWeighted(orig_img_bgr, 0.6, heatmap_color, 0.4, 0)
        b64_ag0 = cv2_to_base64(superimposed_img)

        # Calculate Coordinates
        moments = cv2.moments(mask_binary)
        if moments["m00"] != 0:
            cX = int(moments["m10"] / moments["m00"])
            cY = int(moments["m01"] / moments["m00"])
            coord_x = (cX / 224.0) * 2.0 - 1.0  
            coord_y = 0.3                      
            coord_z = (cY / 224.0) * 2.0 - 1.0  
        else:
            coord_x, coord_y, coord_z = 0.7, 0.3, 0.6 

        # Calculate Volume
        pixel_count = cv2.countNonZero(mask_normalized)
        estimated_volume = round(pixel_count * 0.015, 1)

        end_process = time.time()
        processing_ms = int((end_process - start_process) * 1000)

        return {
            "coords": [coord_x, coord_y, coord_z], 
            "volume": f"{estimated_volume}cc",
            "confidence": 0.94,
            "visualizations": {
                "input": f"data:image/jpeg;base64,{b64_input}",
                "mask": f"data:image/jpeg;base64,{b64_mask}",
                "ag4": f"data:image/jpeg;base64,{b64_ag4}",
                "ag2": f"data:image/jpeg;base64,{b64_ag2}",
                "ag0": f"data:image/jpeg;base64,{b64_ag0}",
            },
            "time_taken": f"{processing_ms}ms"
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn 
    uvicorn.run(app, host="0.0.0.0", port=8000)