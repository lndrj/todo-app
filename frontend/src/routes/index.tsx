import { Badge } from "@/components/ui/badge";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-md p-8">
        <header className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Todo
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Minimalist frontend for managing todos.
            </p>
          </div>

          <div className="text-right">
            <Badge variant={"secondary"}>Local demo</Badge>
          </div>
        </header>

        <main className="mt-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            This is a simple home page I made just to try out a typical Todo app
            when toying around with <strong>Rust</strong> as a backend.
            <br />
            Data is stored in SQLite local memory file made in backend folder.
            All operations are communicating via fetch and REST API.
          </p>

          <div className="flex gap-3">
            <Link
              to="/todos"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Open Todos
            </Link>
          </div>
        </main>

        <footer className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          Tip: press Enter to add a todo on the todos page. You can replace the
          UI with shadcn components whenever you want.
        </footer>
      </div>
    </div>
  );
}
