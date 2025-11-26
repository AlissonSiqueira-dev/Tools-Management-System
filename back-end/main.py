from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Tools Management API")

# Configurar CORS para o Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Porta padrão do Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class Tool(BaseModel):
    id: int
    name: str
    description: str

class ToolCreate(BaseModel):
    name: str
    description: str

# Banco de dados em memória
tools_db = []
current_id = 1

@app.get("/")
def read_root():
    return {"message": "Tools Management API"}

@app.get("/tools", response_model=List[Tool])
def get_tools():
    return tools_db

@app.post("/tools", response_model=Tool)
def create_tool(tool: ToolCreate):
    global current_id
    new_tool = Tool(
        id=current_id,
        name=tool.name,
        description=tool.description
    )
    tools_db.append(new_tool)
    current_id += 1
    return new_tool

@app.delete("/tools/{tool_id}")
def delete_tool(tool_id: int):
    global tools_db
    
    tool_exists = any(tool.id == tool_id for tool in tools_db)
    
    if not tool_exists:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tools_db = [tool for tool in tools_db if tool.id != tool_id]
    return {"message": f"Tool {tool_id} deleted successfully"}

# Dados iniciais
@app.on_event("startup")
def startup_event():
    global tools_db, current_id
    sample_tools = [
        {"id": 1, "name": "Visual Studio Code", "description": "Code editor"},
        {"id": 2, "name": "Git", "description": "Version control system"},
        {"id": 3, "name": "Docker", "description": "Container platform"}
    ]
    tools_db = [Tool(**tool) for tool in sample_tools]
    current_id = 4

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)