from flask import Flask, render_template, request, jsonify, Response
from markdown import markdown
from markupsafe import Markup

import json
from pathlib import Path


# Bookkeeping


read_json = lambda x: json.loads(Path(x).read_text(encoding="utf-8"))
dict2list = lambda x: list(x.items())

cpr_steps = dict2list(read_json("cpr_steps.json"))
cpr_quizzes = dict2list(read_json("cpr_quizzes.json"))

app = Flask(__name__)
FLAG_XIPHOID_SEEN = False


# Custom filters


@app.template_filter("markdown")
def markdown_filter(text):
    return Markup(markdown(text))


# API endpoints


@app.route("/api/flag/<flag_id>", methods=["POST"])
def flag(flag_id):
    globals()[f"FLAG_{flag_id.upper()}"] = True
    return jsonify({"status": "success", "flag_id": flag_id})


# Routes


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/steps/<id>")
def steps(id):
    # could encode 'id = 8', but this is more extensible
    # as '[id - 1]' yields the last element in list
    id = 0 if id == "5extra" else int(id)
    name, details = cpr_steps[id - 1]
    return render_template(
        "steps.html",
        id=id,
        name=name,
        details=details,
        flag_xiphoid_seen=FLAG_XIPHOID_SEEN,
    )


@app.route("/quiz/<id>")
def quizzes(id):
    question, choices = cpr_quizzes[int(id) - 1]
    return render_template(
        "quizzes.html",
        id=id,
        name=name,
        details=details,
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
