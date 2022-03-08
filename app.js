const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

intializeDbAndServer();

//GET todos list
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;

  const getTodosQuery = `
    SELECT *
    FROM todo
    WHERE todo LIKE '%${search_q}%'
    AND status LIKE '%${status}%'
    AND priority LIKE '%${priority}%'`;

  const todoList = await db.all(getTodosQuery);
  response.send(todoList);
});

//GET todo based on Id API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;

  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//POST todo API
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `
    INSERT INTO todo
    (id, todo, priority, status)
    VALUES
    (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );`;

  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//PUT todo API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let column = null;
  let responseText = null;

  const key = Object.keys(request.body)[0];
  const value = request.body[key];

  if (key === "status") {
    column = "status";
    responseText = "Status Updated";
  } else if (key === "priority") {
    column = "priority";
    responseText = "Priority Updated";
  } else if (key === "todo") {
    column = "todo";
    responseText = "Todo Updated";
  }

  const updateTodoQuery = `
  UPDATE todo
  SET ${column} = '${value}'
  WHERE id = ${todoId};`;

  await db.run(updateTodoQuery);
  response.send(responseText);
});

//DELETE todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
