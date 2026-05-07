import os
import json
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

app = FastAPI(title="West Bengal Election Analytics API")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

class PredictRequest(BaseModel):
    turnout: float
    urbanization: float
    literacy: float
    income: float

@app.get("/api/election-data")
def get_election_data():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "election_data.csv"))
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/geojson")
def get_geojson():
    try:
        with open(os.path.join(DATA_DIR, "constituencies.geojson"), "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights")
def get_insights():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "election_data.csv"))
        seat_counts = df["winning_party"].value_counts().to_dict()
        
        # Total votes per party
        parties = ["TMC", "BJP", "CPI(M)", "INC", "Others"]
        total_votes = df["total_votes"].sum()
        
        vote_shares = {}
        for p in parties:
            key = f"{p.lower().replace('(m)', 'm')}_share"
            if key == "cpi(m)_share":
                 key = "cpim_share" # Fix mapping if necessary
            if p == "CPI(M)":
                 key = "cpim_share"
            # Approx actual votes:
            votes = (df[key] / 100 * df["total_votes"]).sum()
            vote_shares[p] = round((votes / total_votes) * 100, 2)

        with open(os.path.join(DATA_DIR, "feature_importance.json"), "r") as f:
            feature_importance = json.load(f)
            
        return {
            "seat_counts": seat_counts,
            "vote_shares": vote_shares,
            "total_votes": int(total_votes),
            "feature_importance": feature_importance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict_party(req: PredictRequest):
    try:
        model = joblib.load(os.path.join(DATA_DIR, "model_rf.pkl"))
        le = joblib.load(os.path.join(DATA_DIR, "label_encoder.pkl"))
        
        # Features order must match training: ["turnout", "urbanization", "literacy", "income"]
        features = [[req.turnout, req.urbanization, req.literacy, req.income]]
        prediction = model.predict(features)
        party = le.inverse_transform(prediction)[0]
        
        probabilities = model.predict_proba(features)[0]
        prob_dict = {le.inverse_transform([i])[0]: round(float(prob)*100, 2) for i, prob in enumerate(probabilities)}
        
        return {
            "predicted_party": party,
            "probabilities": prob_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
