from flask import (
    Flask, render_template,
    request, redirect, url_for,
    jsonify, Response
)
from markdown import markdown
from markupsafe import Markup

import json
from pathlib import Path


# Bookkeeping


read_json = lambda x: json.loads(Path(x).read_text(encoding="utf-8"))
dict2list = lambda x: list(x.items())

cpr_steps = dict2list(read_json("cpr_steps.json"))

def load_quizzes(path: str):
    items = json.loads(Path(path).read_text(encoding="utf-8"))
    return [items[k] for k in sorted(items, key=lambda k: int(items[k]["id"]))]
cpr_quizzes = load_quizzes("cpr_quizzes.json")


app = Flask(__name__)


# Custom filters


@app.template_filter("markdown")
def markdown_filter(text):
    return Markup(markdown(text))


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



@app.route("/quiz/<int:qid>", methods=["GET", "POST"])
def quiz(qid):
    total = len(cpr_quizzes)

    if not (1 <= qid <= total):
        return redirect(url_for("quiz", qid=1))

    quiz_obj = cpr_quizzes[qid - 1]

    if request.method == "POST":
        # TODO: grade answers in request.form
        return redirect(url_for("home"))

    return render_template(
        "quiz.html",
        qid=qid,
        total=total,
        question=quiz_obj["question"],
        q_type=quiz_obj["type"],
        choices=quiz_obj.get("choices", []),
    )



if __name__ == "__main__":
    app.run(debug=True, port=5001)
