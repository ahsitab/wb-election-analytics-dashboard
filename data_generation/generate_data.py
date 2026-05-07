import os
import json
import random
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Constants
NUM_CONSTITUENCIES = 294
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "data")

# Bounding box for West Bengal (approx)
LAT_MIN, LAT_MAX = 21.5, 27.2
LNG_MIN, LNG_MAX = 85.8, 89.8

def generate_geojson():
    # Grid dimensions: 21 rows x 14 cols = 294
    rows, cols = 21, 14
    lat_step = (LAT_MAX - LAT_MIN) / rows
    lng_step = (LNG_MAX - LNG_MIN) / cols
    
    features = []
    centroids = []
    
    idx = 1
    for r in range(rows):
        for c in range(cols):
            # Polygon coordinates
            lat1 = LAT_MIN + r * lat_step
            lat2 = lat1 + lat_step
            lng1 = LNG_MIN + c * lng_step
            lng2 = lng1 + lng_step
            
            # GeoJSON expects rings for polygons: [lng, lat]
            poly = [[
                [lng1, lat1],
                [lng2, lat1],
                [lng2, lat2],
                [lng1, lat2],
                [lng1, lat1]
            ]]
            
            centroid_lat = (lat1 + lat2) / 2
            centroid_lng = (lng1 + lng2) / 2
            
            feature = {
                "type": "Feature",
                "properties": {
                    "id": idx,
                    "name": f"Constituency {idx}"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": poly
                }
            }
            features.append(feature)
            centroids.append({"id": idx, "lat": centroid_lat, "lng": centroid_lng})
            idx += 1
            
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(os.path.join(DATA_DIR, "constituencies.geojson"), "w") as f:
        json.dump(geojson, f)
        
    return centroids

def generate_election_data(centroids):
    parties = ["TMC", "BJP", "CPI(M)", "INC", "Others"]
    
    data = []
    for c in centroids:
        # Demographics
        urbanization = np.clip(np.random.normal(30, 20), 10, 100)
        literacy = np.clip(np.random.normal(75, 10), 50, 100)
        income = np.clip(np.random.normal(50, 15), 20, 100)
        
        # Turnout
        turnout = np.clip(np.random.normal(80, 5), 60, 95)
        total_votes = int(np.random.normal(200000, 30000))
        
        # Party shares - make TMC and BJP dominant based on some pseudo-logic
        # e.g., TMC stronger in high rural, BJP stronger in some areas, etc.
        # But for synthetic data, let's just use random with weights
        weights = [45, 38, 7, 5, 5]
        noise = np.random.normal(0, 5, 5)
        shares = np.maximum(np.array(weights) + noise, 1)
        shares = shares / np.sum(shares) * 100
        
        party_shares = {p: s for p, s in zip(parties, shares)}
        sorted_shares = sorted(party_shares.items(), key=lambda x: x[1], reverse=True)
        
        winning_party = sorted_shares[0][0]
        margin = sorted_shares[0][1] - sorted_shares[1][1]
        
        row = {
            "id": c["id"],
            "name": f"Constituency {c['id']}",
            "lat": c["lat"],
            "lng": c["lng"],
            "total_votes": total_votes,
            "turnout": round(turnout, 2),
            "margin": round(margin, 2),
            "winning_party": winning_party,
            "tmc_share": round(party_shares["TMC"], 2),
            "bjp_share": round(party_shares["BJP"], 2),
            "cpim_share": round(party_shares["CPI(M)"], 2),
            "inc_share": round(party_shares["INC"], 2),
            "others_share": round(party_shares["Others"], 2),
            "urbanization": round(urbanization, 2),
            "literacy": round(literacy, 2),
            "income": round(income, 2)
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    
    # Clustering
    kmeans = KMeans(n_clusters=4, random_state=42)
    df["cluster"] = kmeans.fit_predict(df[["urbanization", "literacy", "income"]])
    
    df.to_csv(os.path.join(DATA_DIR, "election_data.csv"), index=False)
    return df

def train_ml_models(df):
    features = ["turnout", "urbanization", "literacy", "income"]
    X = df[features]
    y = df["winning_party"]
    
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X, y_encoded)
    
    joblib.dump(rf, os.path.join(DATA_DIR, "model_rf.pkl"))
    joblib.dump(le, os.path.join(DATA_DIR, "label_encoder.pkl"))
    
    # Feature importance
    importance = {f: round(imp, 4) for f, imp in zip(features, rf.feature_importances_)}
    with open(os.path.join(DATA_DIR, "feature_importance.json"), "w") as f:
        json.dump(importance, f)

if __name__ == "__main__":
    print("Generating GeoJSON...")
    centroids = generate_geojson()
    print("Generating Election Data...")
    df = generate_election_data(centroids)
    print("Training ML Models...")
    train_ml_models(df)
    print("Data Generation Complete.")
