from flask import Flask, render_template, request, jsonify, Response
from markdown import markdown
from markupsafe import Markup

import re
import json
from pathlib import Path


# Bookkeeping


read_json = lambda x: json.loads(Path(x).read_text(encoding="utf-8"))
dict2list = lambda x: list(x.items())

cpr_steps = read_json("cpr_steps.json")
cpr_steps_names = list(cpr_steps.keys())
cpr_quizzes = dict2list(read_json("cpr_quizzes.json"))

app = Flask(__name__)
FLAG_XIPHOID_SEEN = False


# Custom filters


@app.template_filter("markdown")
def markdown_filter(text):
    md = Markup(markdown(text))
    return re.sub(r"<p>(.*?)</p>", r"\1", md)
    # supports same-line <span>; line sep patched in css


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
    id = 8 if id == "5extra" else int(id)
    name = cpr_steps_names[id - 1]
    return render_template(
        "steps.html",
        id=id,
        name=name,
        details=cpr_steps[name],
        all_steps=cpr_steps_names[:6],  # for Step 7
        flag_xiphoid_seen=FLAG_XIPHOID_SEEN,  # for Step 5/8
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
