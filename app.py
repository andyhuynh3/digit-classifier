import base64
import json
import os
from io import BytesIO

from PIL import Image, ImageOps

import numpy as np
from flask import Flask, render_template, request, url_for
import tensorflow as tf

app = Flask(__name__)
model = tf.keras.models.load_model('mnistCNN.h5')
tf.enable_eager_execution()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        posted_image_bytes = BytesIO(
            base64.urlsafe_b64decode(request.form['img'])
        )
        posted_image = Image.open(posted_image_bytes)
        # print(np.array(posted_image, dtype=np.float32))
        posted_image.thumbnail((28, 28))
        posted_image_array = np.array(posted_image, dtype=np.float32) / 255.0
        posted_image_array = posted_image_array[:, :, 3]
        # print(posted_image_array)
        posted_image_array = posted_image_array.reshape(
            1,
            posted_image_array.shape[0],
            posted_image_array.shape[1],
            1
        )
        probabilities = model(posted_image_array).numpy()
        percent_probabilities = 100 * (probabilities / probabilities.sum())
        prediction = str(probabilities.argmax())
        payload = {}
        payload['prediction'] = prediction
        payload['probabilities'] = {
            i: round(float(probability), 2)
            for i, probability in enumerate(percent_probabilities[0])
        }
        return json.dumps(payload)

@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                 endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


if __name__ == '__main__':
    app.run()
