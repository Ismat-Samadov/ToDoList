# ToDoList
Build a todo list website in python 
To build a todo list website in Python, you can use the Flask web framework and a database to store the tasks. Here's a step-by-step guide to help you get started:

1. Set up the project:
   - Install Flask by running `pip install flask` in your command prompt or terminal.
   - Create a new directory for your project.
   - Inside the project directory, create a virtual environment by running `python -m venv venv`.
   - Activate the virtual environment:
     - On Windows: `venv\Scripts\activate`
     - On macOS/Linux: `source venv/bin/activate`
   - Create a new file called `app.py` in your project directory.

2. Import the required modules:
   - Open `app.py` and add the following import statements:

   ```python
   from flask import Flask, render_template, request, redirect
   import sqlite3
   ```

3. Initialize the Flask application:
   - Add the following code to `app.py`:

   ```python
   app = Flask(__name__)
   ```

4. Create a database and table:
   - Run the following code in your Python interpreter to create a SQLite database and a table to store the tasks:

   ```python
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
   ```

5. Create routes for displaying and adding tasks:
   - Add the following code to `app.py`:

   ```python
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
   ```

6. Create the HTML template:
   - Create a new directory called `templates` inside your project directory.
   - Inside the `templates` directory, create a new file called `index.html`.
   - Add the following code to `index.html`:

   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <title>Todo List</title>
     </head>
     <body>
       <h1>Todo List</h1>
       <ul>
         {% for task in tasks %}
           <li>{{ task[1] }}</li>
         {% endfor %}
       </ul>
       <form action="/add" method="post">
         <input type="text" name="title" placeholder="Enter a new task">
         <button type="submit">Add Task</button>
       </form>
     </body>
   </html>
   ```

7. Run the application:
   - In your command prompt or terminal, navigate to your project directory.
   - Run `flask run` to start the Flask development server.
   - Open your web browser and visit `http://localhost:5000` to see the todo list.

This is a basic implementation of a todo list website. You can enhance it by adding additional features like marking tasks as completed, editing and deleting tasks, and adding CSS styling to make the website visually appealing.