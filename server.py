from flask import Flask, render_template, request, jsonify, Response


# Bookkeeping


app = Flask(__name__)


# Routes


@app.route("/")
def home():
    return render_template("home.html")


if __name__ == "__main__":
    app.run(debug=True, port=5001)
