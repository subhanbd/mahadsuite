
import React from 'react';
import { BlokRecord, Santri } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';

interface BlokManagementViewProps {
  blokRecords: BlokRecord[];
  activeSantriList: Santri[]; // To get ketua blok name
  onAddBlok: () => void;
  onEditBlok: (blok: BlokRecord) => void;
  onDeleteBlok: (id: string) => void;
}

const BlokManagementView: React.FC<BlokManagementViewProps> = ({
  blokRecords,
  activeSantriList,
  onAddBlok,
  onEditBlok,
  onDeleteBlok,
}) => {
  const sortedBlok = [...blokRecords].sort((a,b) => a.namaBlok.localeCompare(b.namaBlok));

  const getKetuaBlokName = (santriId?: string) => {
    if (!santriId) return '-';
    const santri = activeSantriList.find(s => s.id === santriId);
    return santri ? santri.namalengkap : 'Santri Tidak Ditemukan';
  };

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
          Manajemen Blok Pesantren
        </h2>
        <button onClick={onAddBlok} className={addButtonClass}>
          <PlusIcon className="w-5 h-5" />
          Tambah Blok Baru
        </button>
      </div>

      {sortedBlok.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow border border-base-300">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Nama Blok</th>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Ketua Blok</th>
                <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-neutral-content">Jumlah Kamar</th>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-neutral-content">Deskripsi</th>
                <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-neutral-content">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 bg-base-100">
              {sortedBlok.map(blok => (
                <tr key={blok.id} className="hover:bg-base-200/50 transition-colors duration-150">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-content">{blok.namaBlok}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-base-content">{getKetuaBlokName(blok.ketuaBlokSantriId)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-base-content text-center">{blok.jumlahKamar ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-base-content max-w-sm truncate" title={blok.deskripsi}>{blok.deskripsi || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => onEditBlok(blok)} className={buttonClass('edit')} aria-label={`Edit blok ${blok.namaBlok}`}>
                        <PencilIcon className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => onDeleteBlok(blok.id)} className={buttonClass('delete')} aria-label={`Hapus blok ${blok.namaBlok}`}>
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
          <BuildingLibraryIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
          <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Blok Didefinisikan</h3>
          <p className="mt-1 text-sm text-base-content/70">Silakan tambahkan blok baru untuk memulai.</p>
        </div>
      )}
    </div>
  );
};

export default BlokManagementView;
