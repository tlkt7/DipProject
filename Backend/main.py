from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
import io
from dotenv import load_dotenv

load_dotenv()

# ── Model ────────────────────────────────────────────────────────────────────
class CycleLSTM(nn.Module):
    def __init__(self, input_size=6, hidden_size=64, num_layers=2, num_classes=3, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                            batch_first=True, dropout=dropout)
        self.bn = nn.BatchNorm1d(hidden_size)
        self.fc = nn.Linear(hidden_size, num_classes)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        out = self.bn(out)
        out = self.dropout(out)
        return self.fc(out)

FEATURES = ['wt_diff_mean', 'wt_diff_std', 'hrv_mean', 'lf_hf_ratio', 'rr_full', 'rr_deep']
CLASSES = ['Fertility', 'Luteal', 'Menstrual']
PHASE_DISPLAY = {'Fertility': 'Ovulation', 'Luteal': 'Luteal', 'Menstrual': 'Menstrual'}
SEQ_LEN = 10

model = CycleLSTM()
model.load_state_dict(torch.load('../ML Model/models/lstm_cycle.pt', map_location='cpu'))
model.eval()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "CycleAI API running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    # Сохраняем сырые значения для метрик
    raw = df[FEATURES].copy()

    # Нормализация per-subject z-score для модели
    df_norm = df.copy()
    for feat in FEATURES:
        mean = df[feat].mean()
        std = df[feat].std()
        df_norm[feat] = (df[feat] - mean) / (std if std > 0 else 1)

    values = df_norm[FEATURES].values.astype(np.float32)
    n_days = len(values)

    daily_predictions = []
    for i in range(n_days - SEQ_LEN + 1):
        window = torch.tensor(values[i:i+SEQ_LEN]).unsqueeze(0)
        with torch.no_grad():
            logits = model(window)
            probs = torch.softmax(logits, dim=1).squeeze()
            pred_idx = probs.argmax().item()
            confidence = round(probs[pred_idx].item() * 100, 1)
            phase = PHASE_DISPLAY[CLASSES[pred_idx]]
        daily_predictions.append({
            "day": i + SEQ_LEN,
            "phase": phase,
            "confidence": confidence
        })

    # Текущая фаза = последнее предсказание
    current = daily_predictions[-1]

    # Метрики последнего дня
    last = df[FEATURES].iloc[-1]

    return {
        "current_phase": current["phase"],
        "confidence": current["confidence"],
        "cycle_day": n_days,
        "total_days": n_days,
        "daily_predictions": daily_predictions,
        "metrics": {
            "hrv": round(float(raw['hrv_mean'].iloc[-1]), 1),
            "temperature_diff": round(float(raw['wt_diff_mean'].iloc[-1]), 3),
            "breathing_rate": round(float(raw['rr_full'].iloc[-1]), 1),
            "lf_hf_ratio": round(float(raw['lf_hf_ratio'].iloc[-1]), 3)
        }
    }
