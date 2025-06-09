
import React from 'react';
import { User, UserRole, userRoleDisplayNames } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';

interface UserManagementViewProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ 
  users, 
  onAddUser, 
  onEditUser, 
  onDeleteUser 
}) => {
  
  const buttonClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100";
  const editButtonClass = `${buttonClass} text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500`;
  const deleteButtonClass = `${buttonClass} text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500`;
  const addButtonClass = `flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-neutral text-sm`;

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-3 sm:mb-0">
          Manajemen Pengguna
        </h2>
        <button 
          onClick={onAddUser}
          className={addButtonClass}
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Pengguna Baru
        </button>
      </div>

      <div className="text-sm text-base-content/70 mb-8 p-4 bg-yellow-50 border border-yellow-300 rounded-md shadow">
        <p className="font-semibold text-yellow-700">Penting Mengenai Keamanan:</p>
        <ul className="list-disc list-inside ml-2 text-yellow-600">
            <li>Saat ini, password pengguna disimpan dalam format teks biasa di Local Storage browser.</li>
            <li>Ini **TIDAK AMAN** dan hanya dilakukan untuk keperluan demonstrasi pada aplikasi frontend ini.</li>
            <li>Pada aplikasi production, password harus di-hash dengan aman dan dikelola oleh sistem backend.</li>
        </ul>
      </div>


      {users.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow border border-base-300">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Username</th>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Nama Lengkap</th>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Role</th>
                <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-neutral-content">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 bg-base-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-base-200/50 transition-colors duration-150">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-content">{user.username}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-base-content">{user.namaLengkap}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-base-content">{userRoleDisplayNames[user.role]}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onEditUser(user)}
                        className={editButtonClass}
                        aria-label={`Edit pengguna ${user.username}`}
                      >
                        <PencilIcon className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user.id)}
                        className={deleteButtonClass}
                        aria-label={`Hapus pengguna ${user.username}`}
                      >
                        <TrashIcon className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow">
            <svg className="mx-auto h-16 w-16 text-slate-400 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-3.741-1.066M18 18.72m-12 0a5.971 5.971 0 013.741-1.066m0 0M12 15a3 3 0 100-6 3 3 0 000 6zm0 0a9 9 0 100-18 9 9 0 000 18zm-9.003-3.188A11.957 11.957 0 0112 3c1.258 0 2.447.197 3.543.553m-6.086 3.447A6.002 6.002 0 0112 6c1.23 0 2.37.352 3.287.947M6 18.719a6.012 6.012 0 013.741-1.066" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Pengguna</h3>
            <p className="mt-1 text-sm text-base-content/70">Silakan tambahkan pengguna baru untuk memulai.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
