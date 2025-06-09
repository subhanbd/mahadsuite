

import React from 'react';
import { Santri, KelasRecord, BlokRecord } from '../types'; 
import SantriListItem from './SantriListItem';
import UsersIcon from './icons/UsersIcon'; 

interface SantriListProps {
  santriList: Santri[];
  onEdit: (santri: Santri) => void;
  onDelete: (id: string) => void;
  onExportPdf: (santri: Santri) => void;
  kelasRecords: KelasRecord[]; 
  blokRecords: BlokRecord[];   
}

const SantriList: React.FC<SantriListProps> = ({ santriList, onEdit, onDelete, onExportPdf, kelasRecords, blokRecords }) => {
  if (santriList.length === 0) {
    return (
      <div className="text-center py-16 bg-base-100 rounded-xl shadow-lg">
        <UsersIcon className="mx-auto h-20 w-20 text-slate-400 mb-6" />
        <h3 className="mt-2 text-2xl font-semibold text-neutral-content">Data Santri Kosong</h3>
        <p className="mt-2 text-base text-base-content/80">Belum ada data santri yang ditambahkan untuk filter ini.</p>
        <p className="mt-1 text-sm text-base-content/60">Silakan klik tombol "Tambah Santri" untuk memulai atau ubah filter pencarian Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-0.5 sm:px-0">
      {santriList.map(santri => (
        <SantriListItem 
            key={santri.id} 
            santri={santri} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onExportPdf={onExportPdf}
            kelasRecords={kelasRecords} 
            blokRecords={blokRecords}
        />
      ))}
    </div>
  );
};

export default SantriList;