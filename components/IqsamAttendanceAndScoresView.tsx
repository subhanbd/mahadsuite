
import React, { useState, useEffect, useMemo } from 'react';
import { IqsamExam, IqsamRegistrationRecord, IqsamResult, Santri, AttendanceStatus, UserRole, daftarAttendanceStatus, KelasRecord, IqsamSubjectScore, SupabaseDefaultFields } from '../types'; 
import UserIcon from './icons/UserIcon';
import PencilIcon from './icons/PencilIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

type IqsamResultPayload = Omit<IqsamResult, SupabaseDefaultFields | 'lastUpdated'>;


interface IqsamManageScoresViewProps {
  iqsamSession: IqsamExam; 
  iqsamRegistrations: IqsamRegistrationRecord[];
  iqsamResults: IqsamResult[]; 
  activeSantriList: Santri[];
  onSaveResult: (resultData: IqsamResultPayload) => void; 
  onOpenNilaiModal: (iqsamRegistrationId: string, santriId: string, santriName: string, iqsamSessionId: string) => void;
  kelasRecords: KelasRecord[];
  currentUserRole: UserRole;
  pageTitle?: string; 
}

const IqsamManageScoresView: React.FC<IqsamManageScoresViewProps> = ({
  iqsamSession,
  iqsamRegistrations,
  iqsamResults,
  activeSantriList,
  onSaveResult,
  onOpenNilaiModal,
  kelasRecords,
  currentUserRole,
  pageTitle 
}) => {
  const [localResults, setLocalResults] = useState<Map<string, Partial<IqsamResult>>>(new Map());
  const [santriDetailsCache, setSantriDetailsCache] = useState<Map<string, { namalengkap: string; nomorktt: string; fotoUrl: string | null; kelas: string }>>(new Map());

  useEffect(() => {
    const newMap = new Map<string, Partial<IqsamResult>>();
    iqsamRegistrations.forEach(reg => {
        const existingResult = iqsamResults.find(res => res.iqsamRegistrationId === reg.id && res.santriId === reg.santriId && res.iqsamSessionId === iqsamSession.id);
        if (existingResult) {
            newMap.set(reg.id, { ...existingResult });
        } else {
            newMap.set(reg.id, {
                iqsamRegistrationId: reg.id,
                santriId: reg.santriId,
                iqsamSessionId: iqsamSession.id,
                kehadiranKeseluruhan: AttendanceStatus.HADIR,
                catatanKehadiran: '',
                scores: [],
            });
        }
    });
    setLocalResults(newMap);
  }, [iqsamRegistrations, iqsamResults, iqsamSession.id]);

  useEffect(() => {
    const newCache = new Map<string, { namalengkap: string; nomorktt: string; fotoUrl: string | null; kelas: string }>();
    for (const santri of activeSantriList) {
      const kelasNama = santri.kelasid ? kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas : 'N/A';
      newCache.set(santri.id, {
        namalengkap: santri.namalengkap,
        nomorktt: santri.nomorktt || '-',
        fotoUrl: santri.pasfotourl || null,
        kelas: kelasNama || 'N/A',
      });
    }
    setSantriDetailsCache(newCache);
  }, [activeSantriList, kelasRecords]);


  const handleAttendanceChange = (regId: string, status: AttendanceStatus) => {
    setLocalResults(prev => {
        const newMap = new Map(prev);
        const currentEntry = newMap.get(regId);
        if (currentEntry) {
            newMap.set(regId, { ...currentEntry, kehadiranKeseluruhan: status });
        }
        return newMap;
    });
  };

  const handleNotesChange = (regId: string, notes: string) => {
     setLocalResults(prev => {
        const newMap = new Map(prev);
        const currentEntry = newMap.get(regId);
        if (currentEntry) {
            newMap.set(regId, { ...currentEntry, catatanKehadiran: notes });
        }
        return newMap;
    });
  };

  const handleSaveAttendanceAndNotes = (regId: string) => {
    const resultToSave = localResults.get(regId);
    if (resultToSave && resultToSave.iqsamRegistrationId && resultToSave.santriId && resultToSave.iqsamSessionId && resultToSave.kehadiranKeseluruhan) {
       const dataToSubmit: IqsamResultPayload = {
        iqsamRegistrationId: resultToSave.iqsamRegistrationId,
        santriId: resultToSave.santriId,
        iqsamSessionId: resultToSave.iqsamSessionId,
        kehadiranKeseluruhan: resultToSave.kehadiranKeseluruhan,
        catatanKehadiran: resultToSave.catatanKehadiran,
        scores: resultToSave.scores || [], 
      };
      onSaveResult(dataToSubmit);
    } else {
        console.warn("Data tidak lengkap untuk menyimpan hasil absensi/catatan", resultToSave);
        alert("Gagal menyimpan, data tidak lengkap.");
    }
  };
  
  const getSantriDisplayDetails = (santriId: string) => {
    return santriDetailsCache.get(santriId) || { namalengkap: 'Santri Tidak Ditemukan', nomorktt: '-', fotoUrl: null, kelas: 'N/A' };
  };

  const isAdminOrSekretariat = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.SEKRETARIAT_SANTRI;
  const isAsatidz = currentUserRole === UserRole.ASATIDZ;
  const sessionKelasNama = kelasRecords.find(k => k.id === iqsamSession.kelasId)?.namaKelas || 'Kelas Tidak Diketahui';
  const inputClass = "w-full text-xs px-2 py-1 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm";
  const radioBaseClass = "w-3.5 h-3.5 text-secondary focus:ring-secondary focus:ring-offset-0 form-radio";

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">
          {pageTitle || `Kelola Nilai & Kehadiran Iqsam`}
        </h2>
        <p className="text-sm text-base-content/70">
          Sesi: {iqsamSession.periode} {iqsamSession.tahunAjaran} - Kelas: {sessionKelasNama} - Mapel: {iqsamSession.mataPelajaran}
        </p>
        <p className="text-xs text-slate-500">Tanggal Ujian: {new Date(iqsamSession.tanggalUjian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      
      {iqsamRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow">
            <InformationCircleIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
            <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Santri Terdaftar</h3>
            <p className="mt-1 text-sm text-base-content/70">Tidak ada santri yang terdaftar pada sesi Iqsam ini.</p>
            {(isAdminOrSekretariat) && <p className="text-sm text-base-content/60">Silakan daftarkan santri melalui menu "Pendaftaran Santri Iqsam".</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {iqsamRegistrations.map(reg => {
            const santri = getSantriDisplayDetails(reg.santriId);
            const currentResult = localResults.get(reg.id);
            const isHadir = currentResult?.kehadiranKeseluruhan === AttendanceStatus.HADIR;
            const totalNilai = currentResult?.scores?.reduce((sum, score) => sum + (score.nilaiAngka || 0), 0) || 0;
            const rataRata = currentResult?.scores && currentResult.scores.length > 0 ? (totalNilai / currentResult.scores.length).toFixed(1) : 'N/A';

            return (
              <div key={reg.id} className="p-4 border border-slate-300 rounded-lg shadow-sm bg-white">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-shrink-0">
                    {santri.fotoUrl ? <img src={santri.fotoUrl} alt={santri.namalengkap} className="w-16 h-16 object-cover rounded-full shadow" />
                                 : <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center shadow"><UserIcon className="w-10 h-10 text-slate-400" /></div>}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-secondary text-md">{santri.namalengkap}</p>
                    <p className="text-xs text-slate-500">KTT: {santri.nomorktt} - Kelas: {santri.kelas}</p>
                    <div className="mt-2 text-xs">
                        <p><strong>Nilai Rata-rata:</strong> <span className="font-bold text-blue-600">{rataRata}</span> ({currentResult?.scores?.length || 0} Mapel)</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 md:ml-auto space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row items-stretch md:items-center w-full md:w-auto">
                    {(isAdminOrSekretariat || isAsatidz) && (
                        <button 
                            onClick={() => onOpenNilaiModal(reg.id, reg.santriId, santri.namalengkap, iqsamSession.id)}
                            className={`w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                isHadir ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500' : 'text-slate-500 bg-slate-100 cursor-not-allowed'
                            }`}
                            disabled={!isHadir}
                            title={isHadir ? "Input/Edit Nilai Per Mapel" : "Santri tidak hadir, tidak bisa input nilai"}
                            aria-label="Input Nilai"
                        >
                            <PencilIcon className="w-3.5 h-3.5" /> Input Nilai Mapel
                        </button>
                    )}
                  </div>
                </div>
                
                {(isAdminOrSekretariat || isAsatidz) && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 md:space-y-0 md:flex md:items-end md:gap-3">
                        <div className="flex-grow">
                            <label className="block text-xs font-medium text-neutral-content/80 mb-0.5">Status Kehadiran Keseluruhan:</label>
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                                {Object.values(AttendanceStatus).map(statusValue => (
                                <div key={statusValue} className="flex items-center">
                                    <input 
                                        id={`${reg.id}-${statusValue}`} 
                                        name={`status-${reg.id}`} 
                                        type="radio" 
                                        checked={currentResult?.kehadiranKeseluruhan === statusValue} 
                                        onChange={() => handleAttendanceChange(reg.id, statusValue)} 
                                        className={`${radioBaseClass} border-gray-300`}
                                    />
                                    <label htmlFor={`${reg.id}-${statusValue}`} className="ml-1.5 block text-xs font-medium text-neutral-content/90">{statusValue}</label>
                                </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-grow-[2]">
                             <label htmlFor={`notes-${reg.id}`} className="block text-xs font-medium text-neutral-content/80 mb-0.5">Catatan Kehadiran (Opsional):</label>
                            <input 
                                type="text" 
                                id={`notes-${reg.id}`}
                                value={currentResult?.catatanKehadiran || ''} 
                                onChange={(e) => handleNotesChange(reg.id, e.target.value)} 
                                placeholder="Keterangan sakit, izin, dll."
                                className={inputClass}
                            />
                        </div>
                        <button 
                            onClick={() => handleSaveAttendanceAndNotes(reg.id)}
                            className="flex-shrink-0 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 w-full md:w-auto"
                            title="Simpan Kehadiran & Catatan untuk santri ini"
                            aria-label="Simpan Kehadiran & Catatan"
                        >
                           <CheckCircleIcon className="w-3.5 h-3.5"/> Simpan Absensi
                        </button>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IqsamManageScoresView;
