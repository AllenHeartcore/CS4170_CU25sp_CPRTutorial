import random
from flask import (
    Flask, render_template,
    request, redirect, url_for,
    jsonify, Response
)
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

def load_quizzes(path: str):
    items = json.loads(Path(path).read_text(encoding="utf-8"))
    return [items[k] for k in sorted(items, key=lambda k: int(items[k]["id"]))]
cpr_quizzes = load_quizzes("cpr_quizzes.json")


app = Flask(__name__)
FLAG_XIPHOID_SEEN = False
FLAG_STEPS_COMPLETED = False


# Custom filters


@app.template_filter("markdown")
def markdown_filter(text: str) -> Markup:
    md = markdown(text)
    md = re.sub(r"<p>(.*?)</p>", r"\1", md)  # supports same-line <span>
    return Markup(md)


# API endpoints


@app.route("/api/flag/<flag_id>", methods=["POST"])
def flag(flag_id):
    globals()[f"FLAG_{flag_id.upper()}"] = True
    return jsonify({"status": "success", "flag_id": flag_id})


# Routes


@app.route("/")
def home():
    return render_template(
        "home.html",
        flag_steps_completed=FLAG_STEPS_COMPLETED,
    )


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


@app.route("/rhythm")
def rhythm():
    return render_template("rhythm.html")


@app.route("/quiz/<int:qid>", methods=["GET", "POST"])
def quiz(qid):
    base_total = len(cpr_quizzes)
    total = base_total + 1

    if not (1 <= qid <= total):
        return redirect(url_for("quiz", qid=1))

    if qid == total:
        correct_order = [str(i) for i in range(1, 7)]

        if request.method == "POST":
            order = request.form.getlist("order") 
            is_correct = order == correct_order

            images = [
                {"num": int(num), "url": url_for("static", filename=f"img/step{num}.svg")}
                for num in order
            ]

            return render_template(
                "quiz_order.html",
                qid=qid,
                total=total,
                images=images,
                submitted=True,
                result=is_correct,
                order=order
            )

        steps = list(range(1, 7))
        random.shuffle(steps)
        images = [
            {"num": num, "url": url_for("static", filename=f"img/step{num}.svg")}
            for num in steps
        ]
        return render_template(
            "quiz_order.html",
            qid=qid,
            total=total,
            images=images,
            submitted=False
        )

    quiz_obj = cpr_quizzes[qid - 1]
    if request.method == "POST":
        return redirect(url_for("quiz", qid=qid + 1 if qid < total else "home"))

    return render_template(
        "quiz.html",
        qid=qid,
        total=total,
        question=quiz_obj["question"],
        q_type=quiz_obj["type"],
        choices=quiz_obj.get("choices", []),
        answer=quiz_obj["answer"],
        static=quiz_obj.get('static', '')
    )

@app.route("/quiz/grade", methods=["GET"])
def grade():
    return render_template("grade.html")


if __name__ == "__main__":
    app.run(debug=True, port=5001)
