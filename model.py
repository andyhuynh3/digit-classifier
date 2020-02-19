import tensorflow as tf
import numpy as np

NUM_CLASSES = 10


def get_mnist_data():
    mnist = tf.keras.datasets.mnist
    (X_train, y_train), (X_test, y_test) = mnist.load_data()
    return X_train, X_test, y_train, y_test


def preprocess_data(X_train, X_test, y_train, y_test):

    X_train, X_test = X_train / 255.0, X_test / 255.0
    X_train = X_train.reshape(*[X_train.shape[i] for i in range(3)], 1)
    X_test = X_test.reshape(*[X_test.shape[i] for i in range(3)], 1)
    y_train, y_test = (
        np.eye(NUM_CLASSES)[y_train],
        np.eye(NUM_CLASSES)[y_test]
    )
    return X_train, X_test, y_train, y_test


def train_model(epochs=5):
    X_train, X_test, y_train, y_test = preprocess_data(*get_mnist_data())

    model = tf.keras.models.Sequential([
        tf.keras.layers.Conv2D(
            32, (5, 5), input_shape=(28, 28, 1), activation='relu'),
        tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
        tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
        tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(NUM_CLASSES, activation='softmax')
    ])

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    model.fit(X_train, y_train, epochs=epochs)
    score = model.evaluate(X_test, y_test)
    print(f"{model.metrics_names[1]}: {score[1]*100}")
    model.save('mnistCNN.h5')


if __name__ == '__main__':
    train_model()
