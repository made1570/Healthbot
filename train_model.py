
import joblib
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression

# Sample training data
texts = [
    "I love fast cars and explosions",     # Action
    "Ghosts and haunted houses scare me",  # Horror
    "He makes me laugh so hard",           # Comedy
    "Their love story was beautiful",      # Romance
    "This thriller kept me on the edge",   # Thriller
    "The courtroom scene was intense",     # Drama
]

labels = ["Action", "Horror", "Comedy", "Romance", "Thriller", "Drama"]

# Text preprocessing
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(texts)

# Model training
model = LogisticRegression()
model.fit(X, labels)

# Save model and vectorizer to pickle files
joblib.dump(model, 'model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')

print("✅ Model and vectorizer saved successfully.")