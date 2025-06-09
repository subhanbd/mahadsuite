
import React from 'react';
import { KelasRecord } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';

interface KelasManagementViewProps {
  kelasRecords: KelasRecord[];
  onAddKelas: () => void;
  onEditKelas: (kelas: KelasRecord) => void;
  onDeleteKelas: (id: string) => void;
}

const KelasManagementView: React.FC<KelasManagementViewProps> = ({
  kelasRecords,
  onAddKelas,
  onEditKelas,
  onDeleteKelas,
}) => {
  const sortedKelas = [...kelasRecords].sort((a,b) => (a.urutanTampilan ?? 99) - (b.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas));

  const buttonClass = (action: 'edit' | 'delete') => 
    `flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 ${
      action === 'edit' ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500' 
                       : 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
    }`;
  
  const addButtonClass = `flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-neutral text-sm`;

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-3 sm:mb-0">
          Manajemen Kelas Pesantren
        </h2>
        <button onClick={onAddKelas} className={addButtonClass}>
          <PlusIcon className="w-5 h-5" />
          Tambah Kelas Baru
        </button>
      </div>

      {sortedKelas.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow border border-base-300">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Nama Kelas</th>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Urutan</th>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Deskripsi</th>
                <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-neutral-content">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 bg-base-100">
              {sortedKelas.map(kelas => (
                <tr key={kelas.id} className="hover:bg-base-200/50 transition-colors duration-150">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-content">{kelas.namaKelas}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-base-content">{kelas.urutanTampilan ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-base-content max-w-sm truncate" title={kelas.deskripsi}>{kelas.deskripsi || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => onEditKelas(kelas)} className={buttonClass('edit')} aria-label={`Edit kelas ${kelas.namaKelas}`}>
                        <PencilIcon className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => onDeleteKelas(kelas.id)} className={buttonClass('delete')} aria-label={`Hapus kelas ${kelas.namaKelas}`}>
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
          <AcademicCapIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
          <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Kelas Didefinisikan</h3>
          <p className="mt-1 text-sm text-base-content/70">Silakan tambahkan kelas baru untuk memulai.</p>
        </div>
      )}
    </div>
  );
};

export default KelasManagementView;
