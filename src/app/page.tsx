"use client";

import { useEffect, useState } from "react";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError("Failed to load notes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        title,
        content,
        ...(editingNote && { id: editingNote._id }),
      };

      const res = await fetch("/api/notes", {
        method: editingNote ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = (await res.json()).message || "Request failed";
        throw new Error(message);
      }

      await fetchNotes();
      setTitle("");
      setContent("");
      setEditingNote(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const message = (await res.json()).message || "Delete failed";
        throw new Error(message);
      }

      await fetchNotes();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Notes App</h1>
          <p className="mt-2 text-slate-600">
            Create, edit, and organize your notes seamlessly.
          </p>
        </header>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold">
            {editingNote ? "Edit Note" : "Add a New Note"}
          </h2>
          {error && (
            <p className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-red-700">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-slate-500 focus:outline-none"
                placeholder="Note title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-slate-500 focus:outline-none"
                rows={4}
                placeholder="Write your note here"
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-2 text-white hover:bg-slate-800"
              >
                {editingNote ? "Update Note" : "Add Note"}
              </button>
              {editingNote && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNote(null);
                    setTitle("");
                    setContent("");
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Your Notes</h2>
          {loading ? (
            <p className="text-slate-600">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-slate-600">No notes found. Start by adding one!</p>
          ) : (
            <ul className="space-y-4">
              {notes.map((note) => (
                <li
                  key={note._id}
                  className="rounded-2xl bg-white p-4 shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{note.title}</h3>
                      <p className="mt-2 text-slate-700 whitespace-pre-line">
                        {note.content}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(note)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note._id)}
                        className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Created {new Date(note.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
