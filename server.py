from flask import Flask, render_template, request, jsonify, Response

import json
from pathlib import Path


# Bookkeeping


read_json = lambda x: json.loads(Path(x).read_text(encoding="utf-8"))
dict2list = lambda x: list(x.items())

cpr_steps = dict2list(read_json("cpr_steps.json"))
app = Flask(__name__)


# Routes


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/steps/<id>")
def steps(id):
    name, details = cpr_steps[int(id) - 1]
    return render_template(
        "steps.html",
        id=id,
        name=name,
        details=details,
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
