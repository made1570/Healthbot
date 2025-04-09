from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load model and vectorizer
model = joblib.load('model.pkl')
vectorizer = joblib.load('vectorizer.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    message = data.get("message")

    if not message:
        return jsonify({'error': 'No message provided'}), 400

    # Transform the message and predict
    vector = vectorizer.transform([message])
    prediction = model.predict(vector)[0]

    return jsonify({'reply': f'This seems like a {prediction} genre'})

if __name__ == '__main__':
    app.run(port=5000)