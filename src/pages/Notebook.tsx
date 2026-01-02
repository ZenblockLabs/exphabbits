import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pin, 
  Trash2, 
  X, 
  Palette,
  Search,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NOTE_COLORS = [
  { name: 'Default', value: 'bg-card', border: 'border-border' },
  { name: 'Red', value: 'bg-red-500/10', border: 'border-red-500/30' },
  { name: 'Orange', value: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { name: 'Yellow', value: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { name: 'Green', value: 'bg-green-500/10', border: 'border-green-500/30' },
  { name: 'Blue', value: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { name: 'Purple', value: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { name: 'Pink', value: 'bg-pink-500/10', border: 'border-pink-500/30' },
];

const STORAGE_KEY = 'notebook-notes';

const Notebook: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      }));
    }
    return [];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'bg-card' });
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      setIsAddingNote(false);
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      color: newNote.color,
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({ title: '', content: '', color: 'bg-card' });
    setIsAddingNote(false);
    toast.success('Note added');
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => 
      n.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: new Date() }
        : n
    ));
    setEditingNote(null);
    toast.success('Note updated');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setEditingNote(null);
    toast.success('Note deleted');
  };

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ));
  };

  const changeColor = (id: string, color: string) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, color } : n
    ));
    setShowColorPicker(null);
  };

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const otherNotes = filteredNotes.filter(n => !n.pinned);

  const getColorBorder = (colorValue: string) => {
    return NOTE_COLORS.find(c => c.value === colorValue)?.border || 'border-border';
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" />
            Notebook
          </h1>
          <p className="text-muted-foreground">
            Your personal notes and ideas
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Add Note Input */}
      <motion.div
        layout
        className={cn(
          "rounded-xl border-2 transition-all duration-200",
          isAddingNote ? "border-primary shadow-lg" : "border-border hover:border-primary/50",
          newNote.color,
          getColorBorder(newNote.color)
        )}
      >
        {!isAddingNote ? (
          <button
            onClick={() => setIsAddingNote(true)}
            className="w-full p-4 text-left text-muted-foreground flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Take a note...
          </button>
        ) : (
          <div className="p-4 space-y-3">
            <Input
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="border-0 text-lg font-medium bg-transparent focus-visible:ring-0 p-0"
              autoFocus
            />
            <Textarea
              placeholder="Take a note..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              className="border-0 bg-transparent focus-visible:ring-0 p-0 min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setNewNote(prev => ({ ...prev, color: color.value }))}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      color.value,
                      color.border,
                      newNote.color === color.value && "ring-2 ring-primary ring-offset-2"
                    )}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote({ title: '', content: '', color: 'bg-card' });
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={addNote}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Pin className="w-3 h-3" /> Pinned
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={setEditingNote}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onChangeColor={changeColor}
                  showColorPicker={showColorPicker}
                  setShowColorPicker={setShowColorPicker}
                  getColorBorder={getColorBorder}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Other Notes */}
      {otherNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Others
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {otherNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={setEditingNote}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onChangeColor={changeColor}
                  showColorPicker={showColorPicker}
                  setShowColorPicker={setShowColorPicker}
                  getColorBorder={getColorBorder}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {notes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No notes yet</p>
          <p className="text-sm">Click above to create your first note</p>
        </div>
      )}

      {/* No results */}
      {notes.length > 0 && filteredNotes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No notes match your search</p>
        </div>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className={cn("sm:max-w-lg", editingNote?.color)}>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="text-lg font-medium"
              />
              <Textarea
                placeholder="Note content..."
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className="min-h-[200px] resize-none"
              />
              <div className="flex items-center gap-1">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setEditingNote({ ...editingNote, color: color.value })}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all",
                      color.value,
                      color.border,
                      editingNote.color === color.value && "ring-2 ring-primary ring-offset-2"
                    )}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button onClick={() => updateNote(editingNote)}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Note Card Component
interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  showColorPicker: string | null;
  setShowColorPicker: (id: string | null) => void;
  getColorBorder: (color: string) => string;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onChangeColor,
  showColorPicker,
  setShowColorPicker,
  getColorBorder,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-lg",
        note.color,
        getColorBorder(note.color)
      )}
      onClick={() => onEdit(note)}
    >
      {note.title && (
        <h3 className="font-semibold mb-2 line-clamp-2">{note.title}</h3>
      )}
      {note.content && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
          {note.content}
        </p>
      )}
      
      {/* Actions */}
      <div 
        className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onTogglePin(note.id)}
        >
          <Pin className={cn("w-4 h-4", note.pinned && "fill-current text-primary")} />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowColorPicker(showColorPicker === note.id ? null : note.id)}
          >
            <Palette className="w-4 h-4" />
          </Button>
          {showColorPicker === note.id && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-popover rounded-lg shadow-lg border flex gap-1 z-10">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => onChangeColor(note.id, color.value)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                    color.value,
                    color.border
                  )}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default Notebook;

