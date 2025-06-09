
import React, { useState, useEffect } from 'react';
import { IqsamExam, IqsamRegistrationRecord, IqsamResult, Santri, AttendanceStatus, UserRole, daftarAttendanceStatus, KelasRecord, IqsamScoreRecord, AppwriteDocument, IqsamSubjectScore } from '../types'; // Updated imports
import UserIcon from './icons/UserIcon';
import PencilIcon from './icons/PencilIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import { storage as appwriteStorage, APPWRITE_BUCKET_ID_SANTRI_PHOTOS } from '../services/appwriteClient';

type IqsamResultPayload = Omit<IqsamResult, 'id' | 'lastUpdated' | keyof AppwriteDocument>;

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
      const existingResult = iqsamResults.find(r => r.iqsamRegistrationId === reg.id);
      if (existingResult) {
        newMap.set(reg.id, { ...existingResult });
      } else {
        newMap.set(reg.id, { 
            iqsamRegistrationId: reg.id, 
            santriId: reg.santriId,
            iqsamSessionId: iqsamSession.id,
            kehadiranKeseluruhan: AttendanceStatus.HADIR, 
            scores: [] 
        });
      }
    });
    setLocalResults(newMap);
  }, [iqsamRegistrations, iqsamResults, iqsamSession.id]);

  useEffect(() => {
    const fetchSantriDetails = async () => {
      const newCache = new Map<string, { namalengkap: string; nomorktt: string; fotoUrl: string | null; kelas: string }>();
      for (const santri of activeSantriList) {
        let fotoUrl: string | null = null;
        if (santri.pasFotoFileId) {
          try {
            const url = appwriteStorage.getFilePreview(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, santri.pasFotoFileId);
            fotoUrl = url.toString();
          } catch (e) { console.error("Failed to get photo preview", e); }
        }
        const kelasNama = santri.kelasid ? kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas : 'N/A';
        newCache.set(santri.id, {
          namalengkap: santri.namalengkap,
          nomorktt: santri.nomorktt || '-',
          fotoUrl,
          kelas: kelasNama || 'N/A',
        });
      }
      setSantriDetailsCache(newCache);
    };
    fetchSantriDetails();
  }, [activeSantriList, kelasRecords]);


  const handleAttendanceChange = (regId: string, status: AttendanceStatus) => {
    setLocalResults(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(regId);
      if (current) {
        newMap.set(regId, { ...current, kehadiranKeseluruhan: status });
      }
      return newMap;
    });
  };
  
  const handleNotesChange = (regId: string, notes: string) => {
    setLocalResults(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(regId);
      if (current) {
        newMap.set(regId, { ...current, catatanKehadiran: notes });
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
      console.error("Data tidak lengkap untuk disimpan", resultToSave);
      alert("Gagal menyimpan: data tidak lengkap.");
    }
  };
  
  const getSantriDisplayDetails = (santriId: string) => {
    return santriDetailsCache.get(santriId) || { namalengkap: 'Memuat...', nomorktt: '-', fotoUrl: null, kelas: 'Memuat...' };
  };

  const isAdminOrSekretariat = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.SEKRETARIAT_SANTRI;
  const isAsatidz = currentUserRole === UserRole.ASATIDZ;

  const sessionKelasNama = kelasRecords.find(k => k.id === iqsamSession.kelasId)?.namaKelas || 'Kelas Tidak Diketahui';

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">Kelola Nilai & Kehadiran Iqsam</h2>
        <p className="text-sm text-base-content/70">
          Sesi: <span className="font-semibold text-secondary">{sessionKelasNama} - {iqsamSession.periode} {iqsamSession.tahunAjaran}</span>
          {iqsamSession.mataPelajaran && <span className="text-xs text-slate-500"> | Mapel: {iqsamSession.mataPelajaran}</span>}
        </p>
         <p className="text-xs text-slate-500">Tanggal Ujian: {new Date(iqsamSession.tanggalUjian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            {iqsamSession.jamMulaiUjian && ` (${iqsamSession.jamMulaiUjian}${iqsamSession.jamSelesaiUjian ? ` - ${iqsamSession.jamSelesaiUjian}` : ''})`}
        </p>
      </div>

      {iqsamRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow">
          <InformationCircleIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
          <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Santri Terdaftar</h3>
          <p className="mt-1 text-sm text-base-content/70">Tidak ada santri yang terdaftar untuk sesi Iqsam ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {iqsamRegistrations.map(reg => {
            const santri = getSantriDisplayDetails(reg.santriId);
            const result = localResults.get(reg.id);
            const attendance = result?.kehadiranKeseluruhan || AttendanceStatus.HADIR;
            const notes = result?.catatanKehadiran || '';
            const canManageScores = isAdminOrSekretariat || isAsatidz;

            return (
              <div key={reg.id} className="p-4 border border-slate-300 rounded-lg shadow-sm bg-white">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-shrink-0">
                    {santri.fotoUrl ? <img src={santri.fotoUrl} alt={santri.namalengkap} className="w-16 h-16 object-cover rounded-full shadow" />
                                 : <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center shadow"><UserIcon className="w-10 h-10 text-slate-400" /></div>}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-neutral-content">{santri.namalengkap}</p>
                    <p className="text-xs text-slate-500">KTT: {santri.nomorktt} | Kelas (saat ini): {santri.kelas}</p>
                  </div>
                  {canManageScores && (
                    <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                       <select
                        key={`${reg.id}-${attendance}`} 
                        value={attendance}
                        onChange={(e) => handleAttendanceChange(reg.id, e.target.value as AttendanceStatus)}
                        className="text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm bg-white text-black flex-grow sm:flex-grow-0"
                        aria-label={`Status Kehadiran ${santri.namalengkap}`}
                      >
                        {daftarAttendanceStatus.map(status => 
                          <option key={status} value={status} style={{ backgroundColor: 'white', color: 'black' }}>
                            {status}
                          </option>
                        )}
                      </select>
                       <input 
                        type="text" 
                        value={notes}
                        onChange={(e) => handleNotesChange(reg.id, e.target.value)}
                        placeholder="Catatan Kehadiran"
                        className="text-xs px-2 py-1.5 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm flex-grow"
                        aria-label={`Catatan Kehadiran ${santri.namalengkap}`}
                      />
                      <button 
                        onClick={() => handleSaveAttendanceAndNotes(reg.id)}
                        className="text-xs px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-md shadow-sm flex items-center justify-center gap-1"
                        title="Simpan Kehadiran & Catatan"
                      >
                        <CheckCircleIcon className="w-3.5 h-3.5" /> Simpan Kehadiran
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-600">Skor Mata Pelajaran ({iqsamSession.mataPelajaran}): 
                        <span className="font-medium">
                            {result?.scores?.find(s => s.mataPelajaran === iqsamSession.mataPelajaran)?.nilaiAngka ?? (result?.kehadiranKeseluruhan !== AttendanceStatus.HADIR ? result?.kehadiranKeseluruhan : '-')}
                        </span>
                    </p>
                    {!canManageScores && result?.kehadiranKeseluruhan && <p className="text-xs text-slate-600">Kehadiran: <span className="font-medium">{result.kehadiranKeseluruhan}</span></p>}
                  </div>
                  {canManageScores && (
                    <button
                      onClick={() => onOpenNilaiModal(reg.id, reg.santriId, santri.namalengkap, iqsamSession.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm"
                    >
                      <PencilIcon className="w-3.5 h-3.5" /> Kelola Nilai ({iqsamSession.mataPelajaran})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IqsamManageScoresView;
