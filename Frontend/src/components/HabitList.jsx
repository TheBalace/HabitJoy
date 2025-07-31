import { useEffect, useState, useMemo } from "react";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ProfilePage from "./ProfilePage";
import { API_BASE_URL } from "../api"; // Import the new base URL

const allBadges = {
  POINTS_100: { name: "Point Collector", description: "Earn your first 100 points." },
  POINTS_500: { name: "Point Enthusiast", description: "Earn 500 points." },
  POINTS_1000: { name: "Point Master", description: "Earn 1,000 points." },
  STREAK_3: { name: "On a Roll!", description: "Maintain a 3-day streak on any habit." },
  STREAK_7: { name: "Weekly Warrior", description: "Maintain a 7-day streak on any habit." },
  STREAK_30: { name: "Month of Mastery", description: "Maintain a 30-day streak on any habit." },
};

const CompletionRing = ({ isCompleted, onClick }) => { const ringSize = 40; const strokeWidth = 4; const radius = (ringSize - strokeWidth) / 2; const circumference = radius * 2 * Math.PI; return ( <div className={`relative flex-shrink-0 cursor-pointer group transition-opacity duration-300`} style={{ width: ringSize, height: ringSize }} onClick={onClick} > <svg className="w-full h-full" viewBox={`0 0 ${ringSize} ${ringSize}`}> <circle className="text-[var(--glass-border)]" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={ringSize / 2} cy={ringSize / 2} /> <circle className="text-emerald-500" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={isCompleted ? 0 : circumference} strokeLinecap="round" fill="transparent" r={radius} cx={ringSize / 2} cy={ringSize / 2} transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`} style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} /> {isCompleted && (<path className="text-emerald-400" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" d={`M${ringSize * 0.3} ${ringSize * 0.55} l${ringSize * 0.15} ${ringSize * 0.15} l${ringSize * 0.3} -${ringSize * 0.3}`} />)} </svg> </div> ); };

const NegativeHabitControls = ({ onSucceed, onFail, todaysAction }) => {
    if (todaysAction === 'success') {
        return <p className="text-sm font-semibold text-emerald-400">Success Logged!</p>;
    }
    if (todaysAction === 'fail') {
        return <p className="text-sm font-semibold text-red-400">Setback Logged.</p>;
    }
    return ( <div className="flex items-center gap-2"> <p className="text-sm text-[var(--text-color-muted)] font-semibold">Succeeded?</p> <button onClick={onSucceed} className="px-3 py-1 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-md transition">Yes</button> <button onClick={onFail} className="px-3 py-1 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-md transition">No</button> </div> );
};

const Sidebar = ({ user, allHabits, selectedArea, setSelectedArea, onLogout }) => { const userLevel = user ? Math.floor(user.points / 100) + 1 : 1; const areas = useMemo(() => { const uniqueAreas = new Set(allHabits.filter(h => !h.isArchived).map(h => h.area || 'General')); return ['All', ...Array.from(uniqueAreas).sort()]; }, [allHabits]); return ( <div className="glass-card p-6 h-full flex flex-col"> {user && ( <div className="text-center flex-shrink-0"> <h2 className="text-2xl font-bold text-[var(--text-color)] drop-shadow">{user.username}</h2> <p className="text-sm text-[var(--text-color-muted)]">Level {userLevel} - {user.points} Points</p> </div> )} <div className="flex-grow overflow-y-auto space-y-4 mt-6 pr-2"> <div className="pb-4"> <button onClick={() => setSelectedArea('Profile')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${selectedArea === 'Profile' ? 'bg-white/20 text-[var(--text-color)] font-semibold' : 'text-[var(--text-color-muted)] hover:bg-white/10 hover:text-[var(--text-color)]'}`}> My Profile </button> </div> <div className="pt-4 border-t border-[var(--glass-border)]"> <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3 drop-shadow">Areas</h3> <ul className="space-y-2"> {areas.map(area => ( <li key={area}> <button onClick={() => setSelectedArea(area)} className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${selectedArea === area ? 'bg-white/20 text-[var(--text-color)] font-semibold' : 'text-[var(--text-color-muted)] hover:bg-white/10 hover:text-[var(--text-color)]'}`} > {area} </button> </li> ))} </ul> </div> <div className="pt-4 border-t border-[var(--glass-border)]"> <button onClick={() => setSelectedArea('Archived')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${selectedArea === 'Archived' ? 'bg-white/20 text-[var(--text-color)] font-semibold' : 'text-[var(--text-color-muted)] hover:bg-white/10 hover:text-[var(--text-color)]'}`}> Archived Habits </button> </div> {user && user.badges && user.badges.length > 0 && ( <div> <h3 className="text-lg font-semibold text-[var(--text-color)] mb-3 drop-shadow">🏆 Badges</h3> <div className="flex flex-wrap gap-2"> {user.badges.map(badgeId => { const badge = allBadges[badgeId]; if (!badge) return null; return ( <div key={badgeId} className="glass-card p-2 text-center rounded-lg" title={`${badge.name}: ${badge.description}`}> <span className="text-2xl">{badge.name.match(/collector/i) ? '💰' : badge.name.match(/warrior/i) ? '🛡️' : '🚀'}</span> </div> ); })} </div> </div> )} </div> <div className="pt-6 border-t border-[var(--glass-border)] flex-shrink-0"> <button onClick={onLogout} className="w-full text-left font-semibold text-[var(--text-color-muted)] hover:text-[var(--text-color)] transition"> Logout </button> </div> </div> ); };

const JournalModal = ({ isOpen, onClose, habit, mode, onSave }) => {
  const [note, setNote] = useState('');
  useEffect(() => { if (mode === 'add') { setNote(''); } }, [isOpen, mode]);
  if (!isOpen || !habit) return null;
  const title = mode === 'add' ? `Log Entry for "${habit.title}"` : `Journal for "${habit.title}"`;
  const allEntries = [ ...(habit.completionLog || []).map(e => ({...e, type: 'success'})), ...(habit.failureLog || []).map(e => ({...e, type: 'fail'})) ].sort((a, b) => new Date(b.date) - new Date(a.date));
  return ( <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"> <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[80vh] flex flex-col"> <h2 className="text-2xl font-bold text-[var(--text-color)] drop-shadow">{title}</h2> {mode === 'add' && ( <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did it go today? (Optional)" className="glass-input w-full h-24 resize-none" /> )} {mode === 'view' && ( <div className="flex-grow overflow-y-auto pr-2 space-y-3"> {allEntries.length > 0 ? allEntries.map((entry, index) => ( <div key={index} className={`p-3 rounded-lg ${entry.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}> <p className="font-semibold text-sm text-[var(--text-color)]"> {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - <span className={entry.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>{entry.type === 'success' ? 'Success' : 'Setback'}</span> </p> {entry.note && <p className="text-sm text-[var(--text-color-muted)] mt-1 italic">"{entry.note}"</p>} </div> )) : <p className="text-[var(--text-color-muted)] text-center">No journal entries yet.</p>} </div> )} <div className="flex justify-end gap-4 pt-4 border-t border-[var(--glass-border)]"> <button onClick={onClose} className="text-[var(--text-color-muted)] hover:text-[var(--text-color)] font-medium transition">Close</button> {mode === 'add' && <button onClick={() => onSave(note)} className="glass-button">Save Entry</button>} </div> </div> </div> );
};

const HabitList = ({ user, onUserUpdate, onLogout }) => {
  const [allHabits, setAllHabits] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedArea, setSelectedArea] = useState('All');
  const defaultFormState = { title: "", description: "", area: "General", isNegative: false, frequency: "", customDays: [], reminderEnabled: false, reminderTime: "" };
  const [newHabit, setNewHabit] = useState(defaultFormState);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editForm, setEditForm] = useState(defaultFormState);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalHabit, setJournalHabit] = useState(null);
  const [journalMode, setJournalMode] = useState('add');
  const [journalAction, setJournalAction] = useState(null);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const handleDayToggle = (setter, formData, day) => { const currentDays = formData.customDays; const newDays = currentDays.includes(day) ? currentDays.filter(d => d !== day) : [...currentDays, day]; setter({ ...formData, customDays: newDays }); };
  const getAuthHeaders = () => { const token = localStorage.getItem("token"); return token ? { Authorization: `Bearer ${token}` } : {}; };
  const getTodaysAction = (habit) => { const today = new Date(); today.setHours(0, 0, 0, 0); const todayTime = today.getTime(); const successToday = habit.completionLog?.find(entry => { const d = new Date(entry.date); d.setHours(0, 0, 0, 0); return d.getTime() === todayTime; }); if (successToday) return 'success'; const failToday = habit.failureLog?.find(entry => { const d = new Date(entry.date); d.setHours(0, 0, 0, 0); return d.getTime() === todayTime; }); if (failToday) return 'fail'; return null; };
  
  useEffect(() => { const fetchAllHabits = async () => { try { const res = await fetch(`${API_BASE_URL}/api/habits/all`, { headers: getAuthHeaders() }); if (!res.ok) throw new Error(`Failed to fetch habits`); const data = await res.json(); setAllHabits(Array.isArray(data) ? data : []); } catch (err) { console.error("Error fetching habits:", err); setAllHabits([]); } }; if (user) { fetchAllHabits(); } }, [needsRefresh, user]);
  const habitsToDisplay = useMemo(() => { const isArchivedView = selectedArea === 'Archived'; let processedHabits = allHabits.filter(h => (h.isArchived || false) === isArchivedView); if (!isArchivedView && selectedArea !== 'All') { processedHabits = processedHabits.filter(h => (h.area || 'General') === selectedArea); } if (filter !== "all") { processedHabits = processedHabits.filter(h => h.frequency?.toLowerCase() === filter); } processedHabits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); if (sortOrder === 'oldest') { processedHabits.reverse(); } return processedHabits; }, [allHabits, selectedArea, filter, sortOrder]);
  const triggerRefresh = () => setNeedsRefresh(prev => !prev);
  const handleApiAction = async (endpoint, method = 'POST', body = null) => { try { const options = { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }; if (body) options.body = JSON.stringify(body); const res = await fetch(endpoint, options); const data = await res.json(); if (!res.ok) { console.warn(data.message || "An API error occurred"); return; } triggerRefresh(); if (data.user && onUserUpdate) { onUserUpdate(data.user); } } catch (err) { console.error("API Action Error:", err); } };
  
  const handleDelete = (id) => handleApiAction(`${API_BASE_URL}/api/habits/${id}`, 'DELETE');
  const handleUndo = (id) => handleApiAction(`${API_BASE_URL}/api/habits/${id}/undo`);
  const handleArchiveToggle = (id) => handleApiAction(`${API_BASE_URL}/api/habits/${id}/archive`, 'PUT');
  const handleReset = (id) => handleApiAction(`${API_BASE_URL}/api/habits/${id}/reset`, 'POST');
  
  const openJournalModal = (habit, action) => { setJournalHabit(habit); setJournalAction(() => action); setJournalMode('add'); setIsJournalModalOpen(true); };
  const handleViewJournal = (habit) => { setJournalHabit(habit); setJournalMode('view'); setIsJournalModalOpen(true); };
  const handleSaveNote = (note) => { if (journalAction === 'complete') { handleApiAction(`${API_BASE_URL}/api/habits/${journalHabit._id}/complete`, 'POST', { note }); } else if (journalAction === 'fail') { handleApiAction(`${API_BASE_URL}/api/habits/${journalHabit._id}/fail`, 'POST', { note }); } setIsJournalModalOpen(false); };
  
  const handleShowAddForm = () => { setEditingHabitId(null); setNewHabit({...defaultFormState, area: selectedArea === 'All' || selectedArea === 'Archived' ? 'General' : selectedArea }); setIsFormVisible(true); };
  const handleEditClick = (habit) => { setEditingHabitId(habit._id); setEditForm({ title: habit.title || "", description: habit.description || "", area: habit.area || "General", isNegative: habit.isNegative || false, frequency: habit.frequency || "", customDays: habit.customDays || [], reminderEnabled: habit.reminderEnabled || false, reminderTime: habit.reminderTime || "" }); setIsFormVisible(true); };
  const handleCloseForm = () => { setEditingHabitId(null); setIsFormVisible(false); };
  const handleFormSubmit = async (e, habitData, url, method) => { e.preventDefault(); const dataToSend = { ...habitData, timezoneOffset: new Date().getTimezoneOffset() }; await handleApiAction(url, method, dataToSend); setIsFormVisible(false); };
  
  const isEditing = editingHabitId !== null;
  const currentFormData = isEditing ? editForm : newHabit;
  const setCurrentFormData = isEditing ? setEditForm : setNewHabit;

  return (
    <>
      <AnalyticsDashboard user={user} isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <JournalModal isOpen={isJournalModalOpen} onClose={() => setIsJournalModalOpen(false)} habit={journalHabit} mode={journalMode} onSave={handleSaveNote} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
        <div className="lg:col-span-1 h-full">
          <Sidebar user={user} allHabits={allHabits} selectedArea={selectedArea} setSelectedArea={setSelectedArea} onLogout={onLogout} />
        </div>

        <div className="lg:col-span-3 h-full flex flex-col">
          {selectedArea === 'Profile' ? (
            <ProfilePage user={user} onUserUpdate={onUserUpdate} />
          ) : (
            <>
              {isFormVisible ? ( 
                <form onSubmit={(e) => isEditing ? handleFormSubmit(e, editForm, `${API_BASE_URL}/api/habits/${editingHabitId}`, 'PUT') : handleFormSubmit(e, newHabit, `${API_BASE_URL}/api/habits`, 'POST')} className="glass-card p-6 space-y-4 mb-8 flex-shrink-0">
                    <h3 className="text-xl font-bold text-[var(--text-color)] drop-shadow">{isEditing ? 'Edit Habit' : 'Add New Habit'}</h3> <div className="pt-2 border-t border-[var(--glass-border)]"><label className="flex items-center justify-between text-[var(--text-color-muted)] cursor-pointer"><span className="font-semibold">Track a habit to break?</span><div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${currentFormData.isNegative ? 'bg-red-500' : 'bg-gray-600'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${currentFormData.isNegative ? 'translate-x-6' : ''}`} /></div><input type="checkbox" className="hidden" checked={currentFormData.isNegative} onChange={(e) => setCurrentFormData({ ...currentFormData, isNegative: e.target.checked })} /></label></div> <input type="text" placeholder="Title (e.g., No Smoking)" value={currentFormData.title} onChange={(e) => setCurrentFormData({ ...currentFormData, title: e.target.value })} className="glass-input" required /><input type="text" placeholder="Description (optional)" value={currentFormData.description} onChange={(e) => setCurrentFormData({ ...currentFormData, description: e.target.value })} className="glass-input" /><input type="text" placeholder="Area (e.g., Health)" value={currentFormData.area} onChange={(e) => setCurrentFormData({ ...currentFormData, area: e.target.value })} className="glass-input" /><select value={currentFormData.frequency} onChange={(e) => setCurrentFormData({ ...currentFormData, frequency: e.target.value, customDays: [] })} className="glass-input"> <option className="text-black" value="">Select frequency</option> <option className="text-black" value="daily">Daily</option> <option className="text-black" value="weekly">Weekly</option> <option className="text-black" value="monthly">Monthly</option> <option className="text-black" value="custom">Custom</option> </select>{currentFormData.frequency === "custom" && ( <div className="p-3 bg-white/5 rounded-lg space-y-2"> {weekdays.map(day => (<label key={day} className="flex items-center text-[var(--text-color-muted)] cursor-pointer"><input type="checkbox" checked={currentFormData.customDays.includes(day)} onChange={() => handleDayToggle(setCurrentFormData, currentFormData, day)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-violet-500 focus:ring-violet-500" /><span className="ml-3 text-sm">{day}</span></label>))} </div> )}<div className="pt-2 border-t border-[var(--glass-border)]"><label className="flex items-center text-[var(--text-color-muted)] cursor-pointer"><input type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-violet-500 focus:ring-violet-500" checked={currentFormData.reminderEnabled} onChange={(e) => setCurrentFormData({ ...currentFormData, reminderEnabled: e.target.checked, ...(!e.target.checked && { reminderTime: "" }) })}/><span className="ml-3 font-semibold">Enable Reminders?</span></label></div>{currentFormData.reminderEnabled && (<input type="time" className="glass-input" value={currentFormData.reminderTime} onChange={(e) => setCurrentFormData({ ...currentFormData, reminderTime: e.target.value })} required />)}<div className="flex gap-4 items-center pt-2"> <button type="submit" className="glass-button">{isEditing ? 'Save Changes' : 'Add Habit'}</button> <button type="button" onClick={handleCloseForm} className="text-[var(--text-color-muted)] hover:text-[var(--text-color)] font-medium transition">Cancel</button> </div>
                </form>
              ) : (
                <div className="flex-grow flex flex-col min-h-0">
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4 flex-shrink-0">
                      <h2 className="text-3xl font-bold text-[var(--text-color)] drop-shadow">{selectedArea} Habits</h2>
                      <div className="flex items-center gap-4">
                          {selectedArea !== 'Archived' && ( <> <button onClick={() => setIsAnalyticsOpen(true)} className="glass-button bg-sky-600 hover:bg-sky-700"> Analytics </button> <select value={filter} onChange={(e) => setFilter(e.target.value)} className="glass-input"> <option className="text-black" value="all">All</option> <option className="text-black" value="daily">Daily</option> <option className="text-black" value="weekly">Weekly</option> <option className="text-black" value="monthly">Monthly</option> <option className="text-black" value="custom">Custom</option> </select> <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="glass-input"> <option className="text-black" value="newest">Newest</option> <option className="text-black" value="oldest">Oldest</option> </select> <button onClick={handleShowAddForm} className="glass-button flex-shrink-0">+ Add</button> </> )}
                      </div>
                  </div>
                  <div className="overflow-y-auto flex-grow pr-2">
                    {habitsToDisplay.length === 0 ? ( <p className="text-[var(--text-color-muted)] text-center py-8 glass-card">{selectedArea === 'Archived' ? 'No archived habits.' : 'No habits found.'}</p> ) : (
                      <ul className="space-y-4">
                        {habitsToDisplay.map(habit => {
                          const todaysAction = getTodaysAction(habit);
                          return (
                            <li key={habit._id} className="glass-card p-4 flex items-center justify-between">
                              <div className="flex-grow">
                                <p className="font-semibold text-[var(--text-color)] drop-shadow">{habit.title}</p>
                                <p className="text-sm text-[var(--text-color-muted)]">{habit.description}</p>
                                <div className="mt-2 flex items-center gap-4 text-xs text-[var(--text-color-muted)]">
                                  <span>{habit.isNegative ? '✅' : '🔥'} Success Streak: <span className="font-semibold">{habit.currentStreak || 0}</span></span>
                                  <span>🏆 Longest Streak: <span className="font-semibold">{habit.longestStreak || 0}</span></span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 ml-4">
                                {selectedArea === 'Archived' ? ( <> <button onClick={() => handleDelete(habit._id)} className="text-xs font-semibold text-red-400 hover:text-red-500 transition">Delete</button> <button onClick={() => handleArchiveToggle(habit._id)} className="text-xs font-semibold text-emerald-400 hover:text-emerald-500 transition">Restore</button> </>
                                ) : (
                                  <>
                                    <button onClick={() => handleArchiveToggle(habit._id)} className="text-xs font-semibold text-amber-400 hover:text-amber-500 transition">Archive</button>
                                    <button onClick={() => handleViewJournal(habit)} className="text-xs font-semibold text-sky-400 hover:text-sky-500 transition">Journal</button>
                                    <button onClick={() => handleEditClick(habit)} className="text-xs font-semibold text-[var(--text-color-muted)] hover:text-[var(--text-color)] transition">Edit</button>
                                    <button onClick={() => handleReset(habit._id)} className="text-xs font-semibold text-red-400 hover:text-red-500 transition">Reset</button>
                                    {habit.isNegative ? (
                                      <NegativeHabitControls onSucceed={() => openJournalModal(habit, 'complete')} onFail={() => openJournalModal(habit, 'fail')} todaysAction={todaysAction} />
                                    ) : (
                                      <CompletionRing isCompleted={todaysAction === 'success'} onClick={() => todaysAction === 'success' ? handleUndo(habit._id) : openJournalModal(habit, 'complete')} />
                                    )}
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HabitList;
