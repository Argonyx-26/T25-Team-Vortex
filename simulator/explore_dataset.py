"""
Sentinel Mesh — one-time discovery script, not part of the real pipeline.
Run this once to see the actual column names before we write the real mapping.
"""

from nids_datasets import Dataset

data = Dataset(dataset='CIC-IDS2017', subset=['Network-Flows'], files='all')
dataset = data.read(subset='Network-Flows')
df = dataset.to_pandas()

print("Shape:", df.shape)
print("\nColumns:")
print(list(df.columns))  
print("\nFirst 3 rows:")
print(df.head(3))