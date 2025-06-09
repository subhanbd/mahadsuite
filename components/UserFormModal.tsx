
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { User, UserRole, assignableUserRoles, userRoleDisplayNames } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    userData: Pick<User, 'username' | 'namaLengkap' | 'role'> & { password?: string }, 
    documentId?: string
  ) => void;
  initialData?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const getInitialState = () => ({
    username: initialData?.username || '',
    password: '',
    confirmPassword: '',
    namaLengkap: initialData?.namaLengkap || '',
    role: initialData?.role || assignableUserRoles[0] || UserRole.ASATIDZ, // Default to first assignable role
  });

  const [formData, setFormData] = useState(getInitialState());
  const [passwordError, setPasswordError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setPasswordError('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "password" || name === "confirmPassword") {
      setPasswordError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!formData.username.trim()) {
        alert("Username tidak boleh kosong.");
        return;
    }
    if (!formData.namaLengkap.trim()) {
        alert("Nama Lengkap tidak boleh kosong.");
        return;
    }
    
    // For new users or if password is being changed, it's required and must match
    if (!initialData || (initialData && formData.password)) {
      if (!formData.password) {
        alert("Password tidak boleh kosong untuk pengguna baru atau jika ingin diubah.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError("Password dan konfirmasi password tidak cocok.");
        return;
      }
    }
    
    const dataToPass: Pick<User, 'username' | 'namaLengkap' | 'role'> & { password?: string } = {
      username: formData.username,
      namaLengkap: formData.namaLengkap,
      role: formData.role,
    };

    if (initialData && !formData.password) {
      // Editing, password not changed, don't send password
    } else if (formData.password) {
      dataToPass.password = formData.password;
    } else if (!initialData && !formData.password) {
      // This case should be caught by the validation above
      // alert("Password is required for new user."); // Should not be reached if validation is correct
      return;
    }
    
    onSubmit(dataToPass, initialData?.id);
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90";

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={initialData ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className={labelClass}>Username <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            className={inputClass}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="namaLengkap" className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="namaLengkap"
            id="namaLengkap"
            value={formData.namaLengkap}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Password {initialData ? '(Kosongkan jika tidak ingin diubah)' : <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className={inputClass}
            autoComplete={initialData ? "new-password" : "current-password"}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Konfirmasi Password {initialData && !formData.password ? '' : <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`${inputClass} ${passwordError ? 'border-red-500 ring-red-500' : ''}`}
            autoComplete={initialData ? "new-password" : "current-password"}
          />
          {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
        </div>
        <div>
          <label htmlFor="role" className={labelClass}>Role <span className="text-red-500">*</span></label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            className={inputClass}
            required
          >
            {assignableUserRoles.map(role => (
              <option key={role} value={role}>
                {userRoleDisplayNames[role]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-base-300 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md"
          >
            {initialData ? 'Simpan Perubahan' : 'Tambah Pengguna'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
