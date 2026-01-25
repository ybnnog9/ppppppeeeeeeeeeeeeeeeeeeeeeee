from __future__ import annotations

import os
import sqlite3
from datetime import datetime
from pathlib import Path

from flask import Flask, g, redirect, render_template, request, url_for

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "leads.db"

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev")


SCHEMA = """
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'Nuevo',
    notes TEXT,
    created_at TEXT NOT NULL
);
"""


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception: Exception | None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    db = get_db()
    db.executescript(SCHEMA)
    db.commit()


@app.before_request
def ensure_db() -> None:
    init_db()


@app.route("/")
def index() -> str:
    db = get_db()
    leads = db.execute(
        "SELECT * FROM leads ORDER BY datetime(created_at) DESC"
    ).fetchall()
    stats = db.execute(
        "SELECT status, COUNT(*) as total FROM leads GROUP BY status"
    ).fetchall()
    return render_template("index.html", leads=leads, stats=stats)


@app.route("/leads/new", methods=["GET", "POST"])
def create_lead() -> str:
    if request.method == "POST":
        db = get_db()
        db.execute(
            """
            INSERT INTO leads
                (company_name, contact_name, email, phone, status, notes, created_at)
            VALUES
                (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                request.form["company_name"].strip(),
                request.form["contact_name"].strip(),
                request.form["email"].strip(),
                request.form.get("phone", "").strip(),
                request.form.get("status", "Nuevo"),
                request.form.get("notes", "").strip(),
                datetime.utcnow().isoformat(timespec="seconds"),
            ),
        )
        db.commit()
        return redirect(url_for("index"))
    return render_template("form.html", lead=None)


@app.route("/leads/<int:lead_id>/edit", methods=["GET", "POST"])
def edit_lead(lead_id: int) -> str:
    db = get_db()
    lead = db.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
    if lead is None:
        return redirect(url_for("index"))
    if request.method == "POST":
        db.execute(
            """
            UPDATE leads
            SET company_name = ?, contact_name = ?, email = ?, phone = ?, status = ?, notes = ?
            WHERE id = ?
            """,
            (
                request.form["company_name"].strip(),
                request.form["contact_name"].strip(),
                request.form["email"].strip(),
                request.form.get("phone", "").strip(),
                request.form.get("status", "Nuevo"),
                request.form.get("notes", "").strip(),
                lead_id,
            ),
        )
        db.commit()
        return redirect(url_for("index"))
    return render_template("form.html", lead=lead)


@app.route("/leads/<int:lead_id>/delete", methods=["POST"])
def delete_lead(lead_id: int) -> str:
    db = get_db()
    db.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    db.commit()
    return redirect(url_for("index"))


@app.route("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
