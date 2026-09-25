import pandas as pd

columns = [
    "duration","protocol_type","service","flag","src_bytes","dst_bytes","land",
    "wrong_fragment","urgent","hot","num_failed_logins","logged_in","num_compromised",
    "root_shell","su_attempted","num_root","num_file_creations","num_shells",
    "num_access_files","num_outbound_cmds","is_host_login","is_guest_login","count",
    "srv_count","serror_rate","srv_serror_rate","rerror_rate","srv_rerror_rate",
    "same_srv_rate","diff_srv_rate","srv_diff_host_rate","dst_host_count",
    "dst_host_srv_count","dst_host_same_srv_rate","dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate","dst_host_srv_diff_host_rate","dst_host_serror_rate",
    "dst_host_srv_serror_rate","dst_host_rerror_rate","dst_host_srv_rerror_rate",
    "class"
]

# Find where the actual data starts (after the @data line)
with open('KDDTest+.arff', 'r') as f:
    lines = f.readlines()

data_start = next(i for i, line in enumerate(lines) if line.strip().lower() == '@data') + 1
data_lines = lines[data_start:]

# Write just the data rows to a temp CSV-like buffer and load with pandas
from io import StringIO
df = pd.read_csv(StringIO(''.join(data_lines)), header=None, names=columns)

df.to_csv('nslkdd_test.csv', index=False)
print(df.shape)
print(df.head())