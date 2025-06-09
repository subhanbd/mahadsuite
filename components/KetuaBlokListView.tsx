
import React, { useState, useEffect, useMemo } from 'react';
import { BlokRecord, Santri, KelasRecord, SantriStatus } from '../types';
import UserIcon from './icons/UserIcon';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon'; 
import UserGroupIcon from './icons/UserGroupIcon'; 
// No Appwrite storage import

interface KetuaBlokWithDetails extends BlokRecord {
  ketuaNama: string;
  ketuaFotoUrl?: string | null; // Will come from Santri.pasfotourl
  ketuaKelas: string;
  jumlahSantri: number;
}

interface KetuaBlokListViewProps {
  blokRecords: BlokRecord[];
  santriList: Santri[];
  kelasRecords: KelasRecord[];
}

const KetuaBlokListView: React.FC<KetuaBlokListViewProps> = ({
  blokRecords,
  santriList,
  kelasRecords,
}) => {
  const blokDetailsList = useMemo(() => {
    return blokRecords.map(blok => {
      const ketua = blok.ketuaBlokSantriId ? santriList.find(s => s.id === blok.ketuaBlokSantriId && s.status === SantriStatus.AKTIF) : null;
      const jumlahSantri = santriList.filter(s => s.blokid === blok.id && s.status === SantriStatus.AKTIF).length;
      const ketuaKelasName = ketua && ketua.kelasid ? kelasRecords.find(k => k.id === ketua.kelasid)?.namaKelas : 'N/A';
      
      return {
        ...blok,
        ketuaNama: ketua ? ketua.namalengkap : 'Belum Ditentukan',
        ketuaFotoUrl: ketua?.pasfotourl, // Use pasfotourl directly
        ketuaKelas: ketuaKelasName || 'N/A',
        jumlahSantri,
      };
    }).sort((a,b) => a.namaBlok.localeCompare(b.namaBlok));
  }, [blokRecords, santriList, kelasRecords]);


  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-3 sm:mb-0">
          Daftar Ketua Blok & Statistik
        </h2>
      </div>

      {blokDetailsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blokDetailsList.map(blok => (
            <div key={blok.id} className="bg-base-200/60 rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-secondary mb-3 flex items-center">
                <BuildingLibraryIcon className="w-6 h-6 mr-2 text-secondary/80"/>
                {blok.namaBlok}
              </h3>
              
              <div className="mb-4 p-3 bg-base-100 rounded-md shadow-sm">
                <p className="text-sm text-neutral-content font-medium mb-1">Ketua Blok:</p>
                <div className="flex items-center gap-3">
                  {blok.ketuaFotoUrl ? (
                    <img src={blok.ketuaFotoUrl} alt={blok.ketuaNama} className="w-12 h-12 object-cover rounded-full shadow"/>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center shadow">
                      <UserIcon className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-neutral-content">{blok.ketuaNama}</p>
                    {blok.ketuaNama !== 'Belum Ditentukan' && <p className="text-xs text-slate-500">Kelas: {blok.ketuaKelas}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-base-100 rounded-md">
                  <span className="text-neutral-content">Jumlah Kamar:</span>
                  <span className="font-semibold text-secondary">{blok.jumlahKamar ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-base-100 rounded-md">
                  <span className="text-neutral-content">Jumlah Santri Aktif:</span>
                  <span className="font-semibold text-secondary">{blok.jumlahSantri}</span>
                </div>
              </div>
              {blok.deskripsi && <p className="text-xs text-slate-500 mt-3 italic bg-base-100 p-2 rounded-md">Deskripsi: {blok.deskripsi}</p>}
            </div>
          ))}
        </div>
      ) : (
         <div className="text-center py-12 bg-base-200 rounded-lg shadow">
          <UserGroupIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
          <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Blok Didefinisikan</h3>
          <p className="mt-1 text-sm text-base-content/70">Data ketua blok akan muncul di sini setelah blok ditambahkan dan ketua blok ditentukan.</p>
        </div>
      )}
    </div>
  );
};

export default KetuaBlokListView;
