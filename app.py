from flask import Flask, render_template, request, redirect
import sqlite3
app = Flask(__name__)
conn = sqlite3.connect('tasks.db')
c = conn.cursor()
c.execute('''
    CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN
    )
''')
conn.commit()
conn.close()
@app.route('/')
def index():
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute('SELECT * FROM tasks')
    tasks = c.fetchall()
    conn.close()
    return render_template('index.html', tasks=tasks)

@app.route('/add', methods=['POST'])
def add():
    title = request.form['title']
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute('INSERT INTO tasks (title, completed) VALUES (?, ?)', (title, False))
    conn.commit()
    conn.close()
    return redirect('/')
