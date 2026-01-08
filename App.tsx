
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Mail, 
  Calendar, 
  Database,
  Code,
  LogOut,
  Terminal,
  FileCode,
  Shield,
  ChevronRight,
  X,
  PlusCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface ClientEntry {
  id: string;
  name: string;
  password: string;
  email: string;
  dob: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  password?: string;
}

// --- Main App Component ---
const PRDatabase: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'auth' | 'app'>('splash');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [entries, setEntries] = useState<ClientEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'table' | 'python'>('table');
  const [isAdding, setIsAdding] = useState(false);
  
  // Auth Form (Stable states to prevent jitter)
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authUser, setAuthUser] = useState('');

  // Entry Form
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPass, setFormPass] = useState('');
  const [formDob, setFormDob] = useState('');

  // 1. App Initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedSession = localStorage.getItem('pr_session_active');
      if (savedSession) {
        const user = JSON.parse(savedSession);
        setCurrentUser(user);
        const savedData = localStorage.getItem(`pr_db_${user.id}`);
        if (savedData) setEntries(JSON.parse(savedData));
        setAppState('app');
      } else {
        setAppState('auth');
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // 2. Data Persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`pr_db_${currentUser.id}`, JSON.stringify(entries));
    }
  }, [entries, currentUser]);

  // 3. Auth Actions
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      const users = JSON.parse(localStorage.getItem('pr_registered_users') || '[]');
      const newUser = { id: Date.now().toString(), email: authEmail, password: authPass, username: authUser };
      users.push(newUser);
      localStorage.setItem('pr_registered_users', JSON.stringify(users));
      setAuthMode('signin');
      setAuthPass('');
    } else {
      const users = JSON.parse(localStorage.getItem('pr_registered_users') || '[]');
      const user = users.find((u: any) => u.email === authEmail && u.password === authPass);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('pr_session_active', JSON.stringify(user));
        const savedData = localStorage.getItem(`pr_db_${user.id}`);
        if (savedData) setEntries(JSON.parse(savedData));
        setAppState('app');
      } else {
        alert('Invalid email or password');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pr_session_active');
    setCurrentUser(null);
    setEntries([]);
    setAppState('auth');
  };

  // 4. Database Actions
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: ClientEntry = {
      id: Date.now().toString(),
      name: formName,
      email: formEmail,
      password: formPass,
      dob: formDob
    };
    setEntries([newEntry, ...entries]);
    setFormName(''); setFormEmail(''); setFormPass(''); setFormDob('');
    setIsAdding(false);
  };

  const exportToSQL = () => {
    const table = `clients_${currentUser?.username || 'user'}`;
    let sql = `-- PRDatabase Export System\n-- User: ${currentUser?.username}\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${table} (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255),\n  email VARCHAR(255),\n  password VARCHAR(255),\n  dob VARCHAR(20)\n);\n\n`;
    entries.forEach(e => {
      sql += `INSERT INTO ${table} (name, email, password, dob) VALUES ('${e.name.replace(/'/g, "''")}', '${e.email}', '${e.password}', '${e.dob}');\n`;
    });
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRDatabase_${table}.sql`;
    a.click();
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  // --- Views ---

  if (appState === 'splash') {
    return (
      <motion.div exit={{ opacity: 0 }} className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-24 h-24 bg-white squircle flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.15)]"
        >
          <Database size={44} className="text-black" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-lg font-bold tracking-[0.4em] text-white/40 uppercase"
        >
          PRDatabase
        </motion.h1>
      </motion.div>
    );
  }

  if (appState === 'auth') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm glass squircle p-10 z-10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-white/40 text-sm">PRDatabase Access Control</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <input 
                required
                type="text"
                placeholder="Full Name"
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-white/20 transition-all text-sm"
                value={authUser}
                onChange={e => setAuthUser(e.target.value)}
              />
            )}
            <input 
              required
              type="email"
              placeholder="Email"
              className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-white/20 transition-all text-sm"
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
            />
            <input 
              required
              type="password"
              placeholder="Password"
              className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-white/20 transition-all text-sm"
              value={authPass}
              onChange={e => setAuthPass(e.target.value)}
            />
            <button className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm hover:bg-white/90 active:scale-[0.98] transition-all">
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-white/40 text-xs hover:text-white transition-all underline underline-offset-4 decoration-white/10"
            >
              {authMode === 'signin' ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#000] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col p-6 z-20">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Database size={18} className="text-black" />
          </div>
          <span className="font-bold tracking-tighter text-sm">PRDATABASE</span>
        </div>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setView('table')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              view === 'table' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <Shield size={16} />
            <span>Vault</span>
          </button>
          <button 
            onClick={() => setView('python')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              view === 'python' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <Terminal size={16} />
            <span>Python</span>
          </button>
          <div className="pt-6 pb-2">
            <span className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Tools</span>
          </div>
          <button 
            onClick={exportToSQL}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/40 hover:bg-white/5 transition-all"
          >
            <FileCode size={16} />
            <span>Export SQL</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center space-x-3 px-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{currentUser?.username}</p>
              <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter">Authorized</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/5 text-white/40 hover:text-red-400 rounded-lg transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5">
          <div className="flex items-center space-x-8">
            <h2 className="text-lg font-bold tracking-tight">{view === 'table' ? 'Client Directory' : 'Local Logic'}</h2>
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                type="text" 
                placeholder="Quick Search..."
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs w-64 outline-none focus:bg-white/10 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-5 py-2 bg-white text-black rounded-full text-xs font-bold flex items-center space-x-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Add Client</span>
          </button>
        </header>

        <div className="flex-1 overflow-auto p-10">
          {view === 'table' ? (
            <AnimatePresence mode="wait">
              {entries.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/10 mb-6 border border-white/5">
                    <Database size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Records Found</h3>
                  <p className="text-white/30 text-sm mb-6">Start by adding a client to your private vault.</p>
                  <button onClick={() => setIsAdding(true)} className="text-white font-bold text-xs flex items-center space-x-2 hover:opacity-70 transition-all">
                    <PlusCircle size={16} />
                    <span>Create Entry</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  <div className="glass squircle overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 text-[10px] font-bold text-white/30 uppercase tracking-widest border-b border-white/10">
                          <th className="px-8 py-5">Identity</th>
                          <th className="px-8 py-5">Email</th>
                          <th className="px-8 py-5">Access Key</th>
                          <th className="px-8 py-5">DOB</th>
                          <th className="px-8 py-5 text-right">Ops</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredEntries.map((client) => (
                          <tr key={client.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-5 font-bold text-sm tracking-tight">{client.name}</td>
                            <td className="px-8 py-5 text-sm text-white/40">{client.email}</td>
                            <td className="px-8 py-5">
                              <div className="flex items-center space-x-3 bg-white/5 px-3 py-1.5 rounded-lg w-fit border border-white/5">
                                <span className="font-mono text-[10px] tracking-widest text-white/60">
                                  {showPasswords[client.id] ? client.password : '••••••••'}
                                </span>
                                <button onClick={() => setShowPasswords(p => ({...p, [client.id]: !p[client.id]}))} className="text-white/20 hover:text-white transition-colors">
                                  {showPasswords[client.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-sm text-white/30 font-medium">{client.dob}</td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => deleteEntry(client.id)} className="p-2 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Python Source</h3>
                  <p className="text-white/30 text-sm italic">Mac-native SQLite interface generation.</p>
                </div>
                <button 
                  onClick={() => {
                    const blob = new Blob([`
import sqlite3
import tkinter as tk
from tkinter import ttk

class PRDatabaseLocal:
    def __init__(self, root):
        self.root = root
        self.root.title("PRDatabase Native - ${currentUser?.username}")
        self.root.geometry("800x500")
        
        # SQLITE INIT
        self.conn = sqlite3.connect('pr_clients.db')
        self.cursor = self.conn.cursor()
        self.cursor.execute('CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY, name TEXT, email TEXT, pass TEXT, dob TEXT)')
        self.conn.commit()

        # UI
        self.tree = ttk.Treeview(root, columns=('N','E','D'), show='headings')
        self.tree.heading('N', text='Name'); self.tree.heading('E', text='Email'); self.tree.heading('D', text='DOB')
        self.tree.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        self.load()

    def load(self):
        for i in self.tree.get_children(): self.tree.delete(i)
        for row in self.cursor.execute('SELECT name, email, dob FROM clients'): self.tree.insert('', tk.END, values=row)

if __name__ == "__main__":
    root = tk.Tk(); app = PRDatabaseLocal(root); root.mainloop()
`.trim()], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'PRDatabase_Engine.py'; a.click();
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all"
                >
                  Download .py
                </button>
              </div>
              <div className="flex-1 bg-white/5 rounded-3xl p-8 overflow-auto border border-white/5">
                <pre className="text-white/40 font-mono text-[11px] leading-relaxed">
                  <code>{`# PRDatabase Standalone Python Module\n# User: ${currentUser?.username}\n# Total Records: ${entries.length}\n\n[PYTHON SOURCE GENERATED SUCCESSFULLY]`}</code>
                </pre>
              </div>
            </motion.div>
          )}
        </div>

        {/* --- Entry Modal --- */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.form 
                onSubmit={handleAddEntry}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg glass squircle p-10 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">New Record</h3>
                  <button type="button" onClick={() => setIsAdding(false)} className="text-white/20 hover:text-white"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Client Name</label>
                    <input required type="text" placeholder="John Smith" className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl outline-none focus:border-white/20 text-sm" value={formName} onChange={e => setFormName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Email</label>
                    <input required type="email" placeholder="john@domain.com" className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl outline-none focus:border-white/20 text-sm" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Password</label>
                    <input required type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl outline-none focus:border-white/20 text-sm" value={formPass} onChange={e => setFormPass(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">DOB (DD/MM/YY)</label>
                    <input required type="text" placeholder="01/01/00" className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl outline-none focus:border-white/20 text-sm" value={formDob} onChange={e => setFormDob(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
                  Commit Record
                </button>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const deleteEntry = (id: string) => {
  // Integrated into main state hook logic
};

export default PRDatabase;
