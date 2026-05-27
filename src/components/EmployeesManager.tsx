import React, { useState } from 'react';
import { Key, Eye, EyeOff, UserPlus, Trash2, ShieldAlert, Check, Users, Shield, User } from 'lucide-react';
import { UserAccount } from '../types';
import { Language, translations } from '../translations';

interface EmployeesManagerProps {
  users: UserAccount[];
  currentUser: UserAccount;
  onCreateUser: (name: string, role: 'admin' | 'cashier', pin: string) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUserPin: (userId: string, newPin: string) => void;
  lang: Language;
}

export default function EmployeesManager({
  users,
  currentUser,
  onCreateUser,
  onDeleteUser,
  onUpdateUserPin,
  lang,
}: EmployeesManagerProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPin, setNewPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);

  // Registration states
  const [showRegForm, setShowRegForm] = useState<boolean>(false);
  const [regName, setRegName] = useState<string>('');
  const [regRole, setRegRole] = useState<'admin' | 'cashier'>('cashier');
  const [regPin, setRegPin] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Eye toggle for individual PIN views
  const [visiblePins, setVisiblePins] = useState<{ [key: string]: boolean }>({});

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  const togglePinVisibility = (userId: string) => {
    setVisiblePins((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleStartEdit = (user: UserAccount) => {
    setEditingUserId(user.id);
    setNewPin('');
    setPinError(null);
    setPinSuccessMsg(null);
  };

  const handleSavePin = (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccessMsg(null);

    const cleanPin = newPin.trim();

    // Validation
    if (!/^\d{4}$/.test(cleanPin)) {
      setPinError(t('errPinFormat'));
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    if (targetUser && targetUser.pin === cleanPin) {
      setPinError(t('errSamePin'));
      return;
    }

    // Save
    onUpdateUserPin(userId, cleanPin);
    setPinSuccessMsg(t('changePinSuccess'));
    
    // Clear state slightly delayed
    setTimeout(() => {
      setEditingUserId(null);
      setNewPin('');
      setPinSuccessMsg(null);
    }, 1200);
  };

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(null);
    setRegError(null);

    const trimmedName = regName.trim();
    if (!trimmedName) {
      setRegError(t('errEmptyName'));
      return;
    }
    if (trimmedName.length < 3) {
      setRegError(t('errShortName'));
      return;
    }
    if (!/^\d{4}$/.test(regPin)) {
      setRegError(t('errPinFormat'));
      return;
    }

    // Dupe check
    if (users.find(u => u.name.toLowerCase() === trimmedName.toLowerCase())) {
      setRegError(t('errDupeUser'));
      return;
    }

    // Success creation
    onCreateUser(trimmedName, regRole, regPin);
    
    const successText = lang === 'ky'
      ? `Кызматкер "${trimmedName}" ийгиликтүү катталды!`
      : `Сотрудник "${trimmedName}" успешно зарегистрирован!`;
    setRegSuccess(successText);

    // Clear register fields
    setRegName('');
    setRegPin('');
    setRegRole('cashier');

    setTimeout(() => {
      setRegSuccess(null);
      setShowRegForm(false);
    }, 1500);
  };

  const handleDeleteClick = (userId: string, userName: string, userRole: string) => {
    // Guards
    if (userRole === 'admin') {
      const adminsCount = users.filter((u) => u.role === 'admin').length;
      if (adminsCount <= 1) {
        alert(t('cannotDeleteLastAdmin'));
        return;
      }
    }

    const confirmMsg = lang === 'ky'
      ? `Сиз чын эле "${userName}" кызматкерин системадан өчүргүңүз келеби?`
      : `Вы действительно хотите удалить сотрудника "${userName}" из системы?`;

    if (window.confirm(confirmMsg)) {
      onDeleteUser(userId);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 select-none">
      
      {/* HEADER PORTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              {lang === 'ky' ? 'Кызматкерлердин тизмеси' : 'Список сотрудников и ПИН-коды'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {lang === 'ky'
              ? 'Бул жерден сиз кызматкерлердин кодун түзө, өчүрө жана өзгөртө аласыз.'
              : 'Управление учетными записями кассиров и администраторов. Вы можете изменить ПИН-код любого сотрудника.'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowRegForm(!showRegForm);
            setRegError(null);
            setRegSuccess(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] ${
            showRegForm
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/10'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          {showRegForm
            ? (lang === 'ky' ? 'Жабуу' : 'Закрыть форму')
            : (lang === 'ky' ? 'Жаңы кызматкер кошуу' : 'Добавить нового сотрудника')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT COLUMN: User Cards List */}
        <div className={`lg:col-span-${showRegForm ? '7' : '12'} flex flex-col gap-4`}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => {
              const isMe = user.id === currentUser.id;
              const isEditing = editingUserId === user.id;
              const isAdminRole = user.role === 'admin';
              const isPinShowed = !!visiblePins[user.id];

              return (
                <div
                  key={user.id}
                  className={`border rounded-2xl p-4 transition-all duration-200 relative ${
                    isMe 
                      ? 'border-emerald-200 bg-emerald-50/15'
                      : 'border-slate-150 bg-slate-50/30'
                  }`}
                >
                  {/* Indicator "МЕНЯ" */}
                  {isMe && (
                    <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest bg-emerald-600 text-white border border-emerald-500/20 px-2 py-0.5 rounded-full select-none">
                      {lang === 'ky' ? 'СИЗ' : 'ВЫ'}
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${user.avatarBg}`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-800 truncate pr-16">{user.name}</h4>
                      
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {isAdminRole ? (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded">
                            {t('roleAdmin')}
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded">
                            {t('roleCashier')}
                          </span>
                        )}

                        <span className="text-[9px] font-mono text-slate-400 font-bold">
                          ID: {user.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PIN Display action area */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-semibold block leading-none">
                        PIN-код:
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono font-black text-xs text-slate-700 tracking-wider">
                          {isPinShowed ? user.pin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(user.id)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                          title={isPinShowed ? "Скрыть" : "Показать PIN-код"}
                        >
                          {isPinShowed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Button change pin */}
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 rounded-xl transition-all cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                        title={t('changePinTitle')}
                      >
                        <Key className="w-3 h-3" />
                        <span>{lang === 'ky' ? 'Кодду алмаштыруу' : 'Сменить ПИН'}</span>
                      </button>

                      {/* Button Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(user.id, user.name, user.role)}
                        disabled={isMe && users.filter(u => u.role === 'admin').length <= 1}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                          isMe && users.filter(u => u.role === 'admin').length <= 1
                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                            : 'border-rose-100 text-rose-500 hover:text-white hover:bg-rose-500 hover:border-rose-500'
                        }`}
                        title={t('deleteUserBtn')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* MINI FORM TO CHANGE PIN */}
                  {isEditing && (
                    <div className="mt-4 p-3 bg-indigo-50/40 border border-indigo-100/60 rounded-xl animate-[fadeIn_0.15s_ease-out]">
                      <form onSubmit={(e) => handleSavePin(e, user.id)} className="space-y-2.5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] uppercase font-black tracking-wider text-indigo-700">
                            {t('newPinLbl')}
                          </label>
                          <div className="flex gap-2.5">
                            <input
                              type="text"
                              maxLength={4}
                              minLength={4}
                              placeholder="Например: 1234"
                              pattern="\d*"
                              value={newPin}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setNewPin(val);
                              }}
                              className="bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-center font-mono font-bold text-xs tracking-widest text-slate-800 flex-1 focus:outline-none"
                              required
                            />
                            <button
                              type="submit"
                              className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t('btnSave')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                            >
                              {lang === 'ky' ? 'Жок' : 'Отмена'}
                            </button>
                          </div>
                        </div>

                        {pinError && (
                          <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            <span>{pinError}</span>
                          </div>
                        )}

                        {pinSuccessMsg && (
                          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>{pinSuccessMsg}</span>
                          </div>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT REGISTER COLUMN: Add User Form */}
        {showRegForm && (
          <div className="lg:col-span-5 bg-slate-50 border border-slate-150 p-5 rounded-2xl animate-[fadeIn_0.18s_ease-out]">
            <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-xs uppercase mb-4 tracking-wider">
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'ky' ? 'Жаңы кызматкерди каттоо' : 'Регистрация нового кассира'}</span>
            </div>

            <form onSubmit={handleRegisterUser} className="space-y-4">
              
              {/* Field: Name */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500">
                  {lang === 'ky' ? 'Кызматкердин аты-жөнү' : 'ФИО Сотрудника'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Например: Кайрат Сабиров"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Field: Role */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500">
                  {lang === 'ky' ? 'Ролу (ыйгарым укук)' : 'Роль в системе'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('cashier')}
                    className={`p-3 rounded-xl border flex flex-col gap-0.5 text-left transition-all ${
                      regRole === 'cashier'
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">{t('roleCashierShort')}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{t('roleCashierDesc')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`p-3 rounded-xl border flex flex-col gap-0.5 text-left transition-all ${
                      regRole === 'admin'
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">{t('roleAdminShort')}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{t('roleAdminDesc')}</span>
                  </button>
                </div>
              </div>

              {/* Field: PIN */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500">
                  {lang === 'ky' ? 'Кирүү коду (ПИН-код)' : 'PIN-код для входа'}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    minLength={4}
                    pattern="\d*"
                    placeholder="4 цифры, например: 4444"
                    value={regPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setRegPin(val);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-bold tracking-widest text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <span className="text-[9px] text-slate-400 block leading-tight">
                  {lang === 'ky' ? 'Код так 4 цифрадан турушу керек.' : 'Кассир будет вводить этот код при выборе своего имени.'}
                </span>
              </div>

              {regError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                {t('btnRegisterUser')}
              </button>

            </form>
          </div>
        )}

      </div>

    </div>
  );
}
