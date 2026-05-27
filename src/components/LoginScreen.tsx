import React, { useState } from 'react';
import { Lock, Unlock, UserPlus, Users, Eye, EyeOff, ShieldAlert, BadgeInfo, Check, Key, HelpCircle, Languages, Trash2 } from 'lucide-react';
import { UserAccount } from '../types';
import { Language, translations } from '../translations';

interface LoginScreenProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  onCreateUser: (name: string, role: 'admin' | 'cashier', pin: string) => void;
  onDeleteUser: (userId: string) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export default function LoginScreen({ users, onLogin, onCreateUser, onDeleteUser, lang, onLangChange }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'cashier'>('cashier');
  const [newUserPin, setNewUserPin] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete User Confirm Modal state
  const [userPendingDelete, setUserPendingDelete] = useState<UserAccount | null>(null);
  const [adminPinForDelete, setAdminPinForDelete] = useState<string>('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  const handleKeyClick = (num: string) => {
    setErrorMsg(null);
    if (pin.length < 4) {
      const updated = pin + num;
      setPin(updated);
      
      // Auto-submit if PIN hits 4 digits
      if (updated.length === 4 && selectedUser) {
        if (selectedUser.pin === updated) {
          onLogin(selectedUser);
        } else {
          setTimeout(() => {
            setErrorMsg(t('wrongPinErr'));
            setPin('');
          }, 150);
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg(null);
    setPin('');
  };

  const handleUserSelect = (user: UserAccount) => {
    setSelectedUser(user);
    setPin('');
    setErrorMsg(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const trimmedName = newUsername.trim();
    if (!trimmedName) {
      setCreateError(t('errEmptyName'));
      return;
    }

    if (trimmedName.length < 3) {
      setCreateError(t('errShortName'));
      return;
    }

    if (!/^\d{4}$/.test(newUserPin)) {
      setCreateError(t('errPinFormat'));
      return;
    }

    // Check if user already exists
    if (users.find(u => u.name.toLowerCase() === trimmedName.toLowerCase())) {
      setCreateError(t('errDupeUser'));
      return;
    }

    onCreateUser(trimmedName, newUserRole, newUserPin);
    
    // Clear state
    setNewUsername('');
    setNewUserPin('');
    setNewUserRole('cashier');
    setShowCreateModal(false);
  };

  const initiateDeleteUser = (user: UserAccount, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting/logging in the user
    setUserPendingDelete(user);
    setAdminPinForDelete('');
    setDeleteErrorMsg(null);
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteErrorMsg(null);

    if (!userPendingDelete) return;

    // Check if the user is the last administrator
    if (userPendingDelete.role === 'admin') {
      const adminsCount = users.filter(u => u.role === 'admin').length;
      if (adminsCount <= 1) {
        setDeleteErrorMsg(t('cannotDeleteLastAdmin'));
        return;
      }
    }

    // Verify admin PIN
    const validAdmin = users.find(u => u.role === 'admin' && u.pin === adminPinForDelete);
    if (!validAdmin) {
      setDeleteErrorMsg(t('errWrongAdminPin'));
      return;
    }

    // PIN is correct, execute delete
    onDeleteUser(userPendingDelete.id);

    // If selectedUser is deleted, clear it from selection
    if (selectedUser?.id === userPendingDelete.id) {
      setSelectedUser(null);
      setPin('');
    }

    setUserPendingDelete(null);
    setAdminPinForDelete('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden font-sans">
      
      {/* Visual Ambient Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* TOP HEADER */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
            С
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-200 uppercase">{t('appName')}</h1>
            <p className="text-[10px] text-slate-500 font-medium">{t('appSubtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Switcher Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-850 p-1 rounded-xl">
            <button
              onClick={() => onLangChange('ru')}
              className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                lang === 'ru' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              РУССКИЙ
            </button>
            <button
              onClick={() => onLangChange('ky')}
              className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                lang === 'ky' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              КЫРГЫЗЧА
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-xl">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wide">{t('terminalNum')}</span>
          </div>
        </div>
      </header>

      {/* CENTER WORKSPACE */}
      <main className="max-w-5xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: User selections */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold tracking-tight text-white">{t('loginScreenTitle')}</h2>
            </div>
            <p className="text-xs text-slate-400">{t('loginScreenSubtitle')}</p>
          </div>

          {/* User grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
            {users.map(user => {
              const isSelected = selectedUser?.id === user.id;
              
              return (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`group relative p-4 rounded-2xl border text-left flex flex-col justify-between h-[115px] cursor-pointer transition-all duration-250 hover:scale-[1.02] focus:outline-none ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/40 text-white'
                      : 'border-slate-900 bg-slate-900/40 hover:bg-slate-900/75 hover:border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white ${user.avatarBg}`}>
                      {user.name.charAt(0)}
                    </div>
                    {user.role === 'admin' ? (
                      <span className="text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                        {t('roleAdmin')}
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold uppercase bg-slate-800 text-slate-400 border border-slate-700/50 px-1.5 py-0.5 rounded">
                        {t('roleCashier')}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold leading-tight truncate pr-6">{user.name}</h3>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">PIN: {user.pin.replace(/\d/g, '•')}</p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Absolute delete button for cashier */}
                  <div
                    title={t('deleteUserBtn')}
                    onClick={(e) => {
                      initiateDeleteUser(user, e);
                    }}
                    className="absolute bottom-2.5 right-2.5 w-6 h-6 text-slate-500 hover:text-rose-400 bg-slate-950/50 hover:bg-rose-500/20 border border-slate-800/80 hover:border-rose-500/30 rounded-lg flex items-center justify-center transition-all cursor-pointer z-10 select-none opacity-50 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}

            {/* Empty block launcher: Add new User Profile Button */}
            <button
              onClick={() => {
                setCreateError(null);
                setShowCreateModal(true);
              }}
              className="p-4 rounded-2xl border border-dashed border-slate-800 bg-transparent hover:bg-slate-900/20 hover:border-slate-700 hover:text-white text-slate-500 transition-all flex flex-col items-center justify-center gap-2 h-[115px] cursor-pointer"
            >
              <UserPlus className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[11px] font-bold">{t('addNewUserProfile')}</span>
            </button>
          </div>

          {/* Quick Help Hints panel */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex gap-2.5 max-w-md">
            <BadgeInfo className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400 leading-relaxed">
              <span className="text-slate-200 font-bold">{t('demoPinsHeader')}</span>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                <li><span className="font-semibold text-indigo-400">{t('demoPinBektur')}</span></li>
                <li><span className="font-semibold text-slate-300">{t('demoPinAiperi')}</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Pin-Pad code entry dialer */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/50 border border-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl relative min-h-[430px]">
          
          <div className="text-center mb-4 w-full">
            {selectedUser ? (
              <>
                <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                  <Unlock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono">{t('terminalAuthTitle')}</span>
                </div>
                <h3 className="text-md font-bold text-white">{selectedUser.name}</h3>
                <p className="text-[10px] text-slate-500 font-medium">{t('loginPinPrompt')}</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-indigo-400 mb-1.5 animate-pulse">
                  <Lock className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono">{t('loginSelectLeft')}</span>
                </div>
                <h3 className="text-md font-extrabold text-slate-300">{t('loginSelectLeftDesc')}</h3>
                <p className="text-[10px] text-slate-500 font-medium max-w-[200px] mx-auto">{t('loginPinProtected')}</p>
              </>
            )}
          </div>

          {/* PIN INPUT STATUS BUBBLES */}
          <div className="my-3 flex justify-center gap-4">
            {[0, 1, 2, 3].map((index) => {
              const hasDigit = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    hasDigit
                      ? 'bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/40'
                      : 'bg-slate-800 border-2 border-slate-700/60'
                  }`}
                />
              );
            })}
          </div>

          {/* Error Message display */}
          <div className="h-4 flex items-center justify-center my-1 w-full">
            {errorMsg && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                {errorMsg}
              </span>
            )}
          </div>

          {/* KEY PAD DIAL BUTTONS */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] mt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                disabled={!selectedUser}
                onClick={() => handleKeyClick(num)}
                className={`h-12 text-md font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 active:bg-slate-800 border ${
                  selectedUser 
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:text-white text-slate-200' 
                    : 'bg-slate-950 border-slate-900/60 text-slate-700 cursor-not-allowed'
                }`}
              >
                {num}
              </button>
            ))}
            
            {/* Show/Hide PIN toggle button */}
            <button
              type="button"
              disabled={!selectedUser}
              onClick={() => setShowPin(!showPin)}
              className={`h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 text-slate-400 border ${
                selectedUser 
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:text-slate-200' 
                  : 'bg-slate-950 border-slate-900/60 text-slate-800 cursor-not-allowed'
              }`}
              title={showPin ? "Скрыть" : "Показать"}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Zero code button */}
            <button
              type="button"
              disabled={!selectedUser}
              onClick={() => handleKeyClick('0')}
              className={`h-12 text-md font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 active:bg-slate-800 border ${
                selectedUser 
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:text-white text-slate-200' 
                  : 'bg-slate-950 border-slate-900/60 text-slate-700 cursor-not-allowed'
              }`}
            >
              0
            </button>

            {/* Backspace code button */}
            <button
              type="button"
              disabled={!selectedUser || pin.length === 0}
              onClick={handleBackspace}
              className={`h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 text-rose-400 border ${
                selectedUser && pin.length > 0
                  ? 'bg-slate-900 border-rose-950/20 hover:bg-rose-950/20' 
                  : 'bg-slate-950 border-slate-900/60 text-slate-800 cursor-not-allowed'
              }`}
            >
              ⌫
            </button>
          </div>

          {/* Clear password text link */}
          <button 
            type="button"
            disabled={!selectedUser || pin.length === 0}
            onClick={handleClear}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-bold transition-colors mt-3.5"
          >
            {t('resetInput')}
          </button>
          
          {/* Visible code preview if eye click enabled */}
          {showPin && pin.length > 0 && (
            <div className="absolute bottom-2 bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono font-black border border-slate-800 tracking-wider text-emerald-400 animate-pulse">
              ВВОД: {pin}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto w-full text-center py-2 text-slate-600 text-[10px] border-t border-slate-905">
        <p>{t('licenseFooterMessage')}</p>
      </footer>

      {/* CREATE ACCOUNT DIALOG MODAL Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm max-h-[90%] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm text-slate-100">{t('newUserModalHeader')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-1 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              {t('newUserModalDesc')}
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
                  {t('newUserNameLbl')}
                </label>
                <input
                  type="text"
                  placeholder="Бектур Саматов"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
                  {t('newUserRoleLbl')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserRole('cashier')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      newUserRole === 'cashier'
                        ? 'bg-slate-800 border-slate-500 text-white font-extrabold'
                        : 'bg-slate-950 border-slate-800/80 text-slate-500 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-[11px]">{t('roleCashierShort')}</span>
                    <span className="text-[8px] font-normal text-slate-400">{t('roleCashierDesc')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserRole('admin')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      newUserRole === 'admin'
                        ? 'bg-slate-800 border-indigo-500 text-indigo-300 font-extrabold'
                        : 'bg-slate-950 border-slate-800/80 text-slate-500 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-[11px] text-indigo-300">{t('roleAdminShort')}</span>
                    <span className="text-[8px] font-normal text-slate-400">{t('roleAdminDesc')}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
                  {t('newUserPinLbl')}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  minLength={4}
                  placeholder="••••"
                  pattern="\d*"
                  value={newUserPin}
                  onChange={(e) => {
                    // Only accept digit numbers
                    const val = e.target.value.replace(/\D/g, '');
                    setNewUserPin(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-center font-mono font-black text-white text-md tracking-widest placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <span className="text-[9px] text-slate-500 mt-1 block">
                  {t('newUserPinDsc')}
                </span>
              </div>

              {createError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5 leading-snug">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {t('btnRegisterUser')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE DIALOG MODAL Overlay */}
      {userPendingDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleDeleteSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-[fadeIn_0.15s_ease-out]">
            
            <div className="bg-rose-950/45 border-b border-rose-950/80 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">{t('confirmDeleteUserHeader')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setUserPendingDelete(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="text-xs text-slate-300 leading-relaxed font-medium">
                {lang === 'ky'
                  ? `Сиз чын эле "${userPendingDelete.name}" кызматкерин кассадан өчүргүңүз келеби? Бул аракетти артка кайтаруу мүмкүн эмес.`
                  : `Вы действительно хотите удалить профиль сотрудника "${userPendingDelete.name}"? Это действие невозможно отменить.`}
              </div>

              {/* Pin verification field */}
              <div className="space-y-1.5 mt-1">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                  {t('authAdminPinLbl')}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  minLength={4}
                  placeholder="••••"
                  pattern="\d*"
                  value={adminPinForDelete}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAdminPinForDelete(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-center font-mono font-black text-white text-md tracking-widest placeholder-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  required
                />
                <span className="text-[9px] text-slate-500 block leading-normal italic font-semibold">
                  {t('demoPinHint')}
                </span>
              </div>

              {deleteErrorMsg && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5 leading-snug">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span>{deleteErrorMsg}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUserPendingDelete(null)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer"
                >
                  {t('deleteUserBtn')}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

