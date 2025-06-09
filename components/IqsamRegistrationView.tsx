
import React, { useState, useMemo } from 'react';
import { IqsamExam, Santri, IqsamRegistrationRecord, IqsamSessionStatus, KelasRecord } from '../types'; // Updated imports
import SearchIcon from './icons/SearchIcon';
import UserPlusIcon from './icons/UserPlusIcon'; 
import TrashIcon from './icons/TrashIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface IqsamRegistrationViewProps {
  iqsamSessions: IqsamExam[]; // Changed IqsamSession to IqsamExam, these should be ALL sessions, filtering happens internally
  activeSantriList: Santri[];
  iqsamRegistrations: IqsamRegistrationRecord[];
  onRegisterSantri: (iqsamSessionId: string, santriIds: string[]) => void;
  onCancelRegistration: (registrationId: string) => void;
  kelasRecords: KelasRecord[];
}

const IqsamRegistrationView: React.FC<IqsamRegistrationViewProps> = ({
  iqsamSessions,
  activeSantriList,
  iqsamRegistrations,
  onRegisterSantri,
  onCancelRegistration,
  kelasRecords,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [santriSearchTerm, setSantriSearchTerm] = useState('');
  const [selectedSantriIdsToRegister, setSelectedSantriIdsToRegister] = useState<Set<string>>(new Set());

  const openSessions = useMemo(() => 
    iqsamSessions.filter(s => s.status === IqsamSessionStatus.PENDAFTARAN_DIBUKA)
                 .sort((a,b) => new Date(b.tanggalBukaPendaftaran || 0).getTime() - new Date(a.tanggalBukaPendaftaran || 0).getTime()), // Added null check for dates
    [iqsamSessions]
  );

  const selectedSession = useMemo(() => 
    openSessions.find(s => s.id === selectedSessionId), 
    [openSessions, selectedSessionId]
  );

  const alreadyRegisteredSantriIds = useMemo(() => {
    if (!selectedSessionId) return new Set<string>();
    return new Set(
      iqsamRegistrations
        .filter(reg => reg.iqsamSessionId === selectedSessionId)
        .map(reg => reg.santriId)
    );
  }, [iqsamRegistrations, selectedSessionId]);

  const availableSantriForRegistration = useMemo(() => {
    if (!selectedSession || !selectedSession.kelasId) return [];
    const lowerSearchTerm = santriSearchTerm.toLowerCase();
    
    return activeSantriList
      .filter(santri => 
        santri.kelasid === selectedSession.kelasId && 
        !alreadyRegisteredSantriIds.has(santri.id) &&
        (santriSearchTerm.trim() === '' || 
         santri.namalengkap.toLowerCase().includes(lowerSearchTerm) || 
         santri.nomorktt?.toLowerCase().includes(lowerSearchTerm))
      )
      .sort((a, b) => a.namalengkap.localeCompare(b.namalengkap))
      .slice(0, santriSearchTerm.trim() === '' ? Infinity : 10); 
  }, [activeSantriList, alreadyRegisteredSantriIds, santriSearchTerm, selectedSession]);

  const registeredSantriDetails = useMemo(() => {
    if (!selectedSessionId) return [];
    return iqsamRegistrations
      .filter(reg => reg.iqsamSessionId === selectedSessionId)
      .map(reg => {
        const santri = activeSantriList.find(s => s.id === reg.santriId);
        const kelas = santri && santri.kelasid ? kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas : 'N/A';
        return {
          registrationId: reg.id,
          santriId: reg.santriId,
          namaLengkap: santri?.namalengkap || 'Santri Tidak Ditemukan',
          nomorKTT: santri?.nomorktt || '-',
          kelas: kelas,
          tanggalRegistrasi: reg.tanggalRegistrasi,
        };
      })
      .sort((a,b) => a.namaLengkap.localeCompare(b.namaLengkap));
  }, [iqsamRegistrations, selectedSessionId, activeSantriList, kelasRecords]);

  const handleToggleSantriSelection = (santriId: string) => {
    setSelectedSantriIdsToRegister(prev => {
      const newSet = new Set(prev);
      if (newSet.has(santriId)) {
        newSet.delete(santriId);
      } else {
        newSet.add(santriId);
      }
      return newSet;
    });
  };

  const handleRegisterSelected = () => {
    if (selectedSessionId && selectedSantriIdsToRegister.size > 0) {
      onRegisterSantri(selectedSessionId, Array.from(selectedSantriIdsToRegister));
      setSelectedSantriIdsToRegister(new Set());
    }
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); } 
    catch { return dateString; }
  };


  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">Pendaftaran Santri untuk Iqsam</h2>
        <p className="text-sm text-base-content/70">Pilih sesi Iqsam yang pendaftarannya dibuka, lalu daftarkan santri dari kelas yang sesuai.</p>
      </div>

      <div>
        <label htmlFor="iqsamSessionSelect" className="block text-sm font-medium text-neutral-content/90 mb-1">Pilih Sesi Iqsam:</label>
        <select
          id="iqsamSessionSelect"
          value={selectedSessionId}
          onChange={(e) => {
            setSelectedSessionId(e.target.value);
            setSantriSearchTerm('');
            setSelectedSantriIdsToRegister(new Set());
          }}
          className="mt-1 block w-full md:w-1/2 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
        >
          <option value="">-- Pilih Sesi Iqsam --</option>
          {openSessions.map(session => {
            const kelasNama = kelasRecords.find(k => k.id === session.kelasId)?.namaKelas || 'Kelas ?';
            return (
                <option key={session.id} value={session.id}>
                {kelasNama} - {session.periode} ({session.tahunAjaran})
                </option>
            )
          })}
        </select>
      </div>

      {selectedSession && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-base-200">
          <section className="space-y-4 p-4 bg-base-200/30 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-neutral-content">Daftarkan Santri ke Sesi Kelas: {kelasRecords.find(k => k.id === selectedSession.kelasId)?.namaKelas || ''}</h3>
            <div>
              <label htmlFor="santriSearch" className="block text-sm font-medium text-neutral-content/90 mb-1">Cari Santri (Nama/KTT) di Kelas Ini:</label>
              <div className="relative">
                <input
                  type="text"
                  id="santriSearch"
                  value={santriSearchTerm}
                  onChange={(e) => setSantriSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                  placeholder="Ketik nama atau KTT..."
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            {availableSantriForRegistration.length > 0 && (
              <div className="max-h-60 overflow-y-auto border border-slate-300 rounded-lg bg-white">
                {availableSantriForRegistration.map(santri => (
                  <div key={santri.id} className="flex items-center justify-between p-2.5 border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                    <div>
                      <span className="font-medium text-neutral-content text-sm">{santri.namalengkap}</span>
                      <span className="text-xs text-slate-500 ml-1">({santri.nomorktt || 'No KTT'})</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedSantriIdsToRegister.has(santri.id)}
                      onChange={() => handleToggleSantriSelection(santri.id)}
                      className="form-checkbox h-4 w-4 text-secondary rounded border-slate-400 focus:ring-secondary"
                    />
                  </div>
                ))}
              </div>
            )}
            {selectedSession && selectedSession.kelasId && santriSearchTerm && availableSantriForRegistration.length === 0 && (
              <p className="text-sm text-slate-500">Tidak ada santri yang cocok di kelas ini atau semua sudah terdaftar.</p>
            )}
             {selectedSession && !selectedSession.kelasId && (
              <p className="text-sm text-red-500">Sesi Iqsam ini belum memiliki data Kelas. Mohon perbarui data sesi.</p>
            )}


            <button
              onClick={handleRegisterSelected}
              disabled={selectedSantriIdsToRegister.size === 0 || !selectedSession.kelasId}
              className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50"
            >
              <UserPlusIcon className="w-5 h-5" /> Daftarkan Santri Terpilih ({selectedSantriIdsToRegister.size})
            </button>
          </section>

          <section className="space-y-4 p-4 bg-base-200/30 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-neutral-content">Santri Terdaftar di Sesi Ini ({registeredSantriDetails.length})</h3>
            {registeredSantriDetails.length > 0 ? (
              <div className="max-h-96 overflow-y-auto border border-slate-300 rounded-lg bg-white">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas (Saat Izin)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {registeredSantriDetails.map(reg => (
                      <tr key={reg.registrationId} className="hover:bg-slate-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-neutral-content">{reg.namaLengkap} <span className="text-xs text-slate-500">({reg.nomorKTT})</span></td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600">{reg.kelas}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => onCancelRegistration(reg.registrationId)} 
                            className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100"
                            title="Batalkan Pendaftaran"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Belum ada santri yang terdaftar untuk sesi ini.</p>
            )}
          </section>
        </div>
      )}
       {!selectedSession && openSessions.length > 0 && (
        <div className="p-6 bg-sky-50 border border-sky-200 rounded-lg text-center text-sky-700 shadow">
            <InformationCircleIcon className="w-10 h-10 mx-auto mb-2"/>
            <p className="font-semibold">Silakan pilih salah satu Sesi Iqsam di atas untuk melanjutkan pendaftaran santri.</p>
        </div>
      )}
       {openSessions.length === 0 && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-700 shadow">
            <InformationCircleIcon className="w-10 h-10 mx-auto mb-2"/>
            <p className="font-semibold">Tidak ada Sesi Iqsam yang sedang membuka pendaftaran saat ini.</p>
            <p className="text-sm">Silakan buat sesi baru atau ubah status sesi yang ada di menu "Manajemen Sesi Iqsam".</p>
        </div>
      )}
    </div>
  );
};

export default IqsamRegistrationView;
