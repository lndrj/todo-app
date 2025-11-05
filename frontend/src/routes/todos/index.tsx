import React, { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

function getTodos() {
  return apiFetch<Todo[]>("/todos", { method: "GET" });
}

//api helper
async function apiFetch<T = any>(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    "x-api-key": "supersecret123",
    ...(opts.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${"http://127.0.0.1:3333"}${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok)
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  // if there's no content (204) return undefined
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

async function createTodoApi(title: string) {
  return apiFetch<Todo>("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

async function updateTodoApi(
  id: number,
  payload: { title: string; done: boolean }
) {
  return apiFetch<Todo>(`/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function deleteTodoApi(id: number) {
  return apiFetch<void>(`/todos/${id}`, { method: "DELETE" });
}

export const Route = createFileRoute("/todos/")({
  component: RouteComponent,
});

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

function RouteComponent() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getTodos().then((data) => setTodos(data));
  }, []);

  useEffect(() => {
    if (editingId != null) {
      inputRef.current?.focus();
    }
  }, [editingId]);

  function addTodo(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const next: Todo = {
      id: Date.now(),
      title: trimmed,
      done: false,
    };
    setTodos((s) => [next, ...s]);
    setTitle("");
    createTodoApi(trimmed)
      .then((created) => {
        setTodos((s) => s.map((t) => (t.id === next.id ? created : t)));
      })
      .catch((err) => {
        console.error("Failed to create todo", err);
        setTodos((s) => s.filter((t) => t.id !== next.id));
      });
  }

  function toggleDone(id: number) {
    const prev = todos.find((t) => t.id === id);
    if (!prev) return;
    const updated = { ...prev, done: !prev.done };
    setTodos((s) => s.map((t) => (t.id === id ? updated : t)));

    updateTodoApi(id, { title: updated.title, done: updated.done })
      .then((remote) => {
        setTodos((s) => s.map((t) => (t.id === id ? remote : t)));
      })
      .catch((err) => {
        console.error("Failed to update todo", err);

        setTodos((s) => s.map((t) => (t.id === id ? prev : t)));
      });
  }

  function removeTodo(id: number) {
    const prev = todos;
    setTodos((s) => s.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingTitle("");
    }

    deleteTodoApi(id).catch((err) => {
      console.error("Failed to delete todo", err);
      setTodos(prev);
    });
  }

  function startEdit(t: Todo) {
    setEditingId(t.id);
    setEditingTitle(t.title);
  }

  function saveEdit() {
    if (editingId == null) return;
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      removeTodo(editingId);
      return;
    }

    const prev = todos;
    setTodos((s) =>
      s.map((t) => (t.id === editingId ? { ...t, title: trimmed } : t))
    );
    setEditingId(null);
    setEditingTitle("");

    updateTodoApi(editingId, {
      title: trimmed,
      done: prev.find((t) => t.id === editingId)?.done ?? false,
    })
      .then((remote) => {
        setTodos((s) => s.map((t) => (t.id === remote.id ? remote : t)));
      })
      .catch((err) => {
        console.error("Failed to save todo", err);
        setTodos(prev);
      });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
      <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Todos</h1>
            <p className="text-sm text-gray-500">
              Manage your todos - saved in .db file.
            </p>
          </div>

          <Link
            to="/"
            className="text-sm px-3 py-2 gap-1 items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex flex-row"
          >
            Back
          </Link>
        </header>

        <form
          onSubmit={addTodo}
          className="flex gap-2 mb-4 justify-center items-center"
        >
          <Input
            className="flex-1"
            placeholder="Add a new todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button
            type="submit"
            className="bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add <Plus />
          </Button>
        </form>

        <div className="h-48 max-h-48 overflow-y-auto space-y-3 pr-2">
          {todos.length === 0 && (
            <div className="h-full flex text-center justify-center items-center text-gray-500 p-6 border rounded-md">
              No todos yet
            </div>
          )}

          {todos.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-3 border rounded-md bg-white dark:bg-slate-900 shadow-sm"
            >
              <Checkbox
                id={`todo-${t.id}`}
                checked={t.done}
                onCheckedChange={() => toggleDone(t.id)}
                className="w-4 h-4 text-indigo-600 rounded"
              />

              <div className="flex-1 min-w-0">
                {editingId === t.id ? (
                  <input
                    ref={inputRef}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                ) : (
                  <label
                    htmlFor={`todo-${t.id}`}
                    className={`block truncate ${
                      t.done ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {t.title}
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingId === t.id ? (
                  <>
                    <Button
                      onClick={saveEdit}
                      className="text-sm px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      className="text-sm px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => startEdit(t)}
                      className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                    >
                      <Wrench />
                      Edit
                    </Button>
                    <Button
                      onClick={() => removeTodo(t.id)}
                      className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      <Trash2 />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
