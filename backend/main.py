from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample data store (replace with database in production)
todos = []

class Todo(BaseModel):
    id: Optional[int] = None
    title: str
    completed: bool = False

class TodoCreate(BaseModel):
    title: str

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to the Todo API"}

@app.get("/api/todos", response_model=List[Todo])
async def get_todos():
    return todos

@app.post("/api/todos", response_model=Todo)
async def create_todo(todo: TodoCreate):
    new_todo = Todo(
        id=len(todos) + 1,
        title=todo.title,
        completed=False
    )
    todos.append(new_todo)
    return new_todo

@app.put("/api/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, todo: Todo):
    for i, t in enumerate(todos):
        if t.id == todo_id:
            todos[i] = todo
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: int):
    for i, todo in enumerate(todos):
        if todo.id == todo_id:
            todos.pop(i)
            return {"message": "Todo deleted successfully"}
    raise HTTPException(status_code=404, detail="Todo not found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 