
import React, { useState, useEffect } from 'react';
import { IqsamExam, IqsamRegistrationRecord, IqsamResult, Santri, AttendanceStatus, UserRole, daftarAttendanceStatus, KelasRecord, IqsamSubjectScore } from '../types'; 
import UserIcon from './icons/UserIcon';
import PencilIcon from './icons/PencilIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
// No Appwrite storage import

type IqsamResultPayload = Omit<IqsamResult, 'id' | 'lastUpdated' | 'created_at' | 'updated_at'>;


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
    // Initialize localResults (remains the same)
    const newMap = new Map<string, Partial<IqsamResult>>();
    iqsamRegistrations.forEach(reg => { /* ... */ });
    setLocalResults(newMap);
  }, [iqsamRegistrations, iqsamResults, iqsamSession.id]);

  useEffect(() => {
    // Santri details cache now uses pasfotourl directly
    const newCache = new Map<string, { namalengkap: string; nomorktt: string; fotoUrl: string | null; kelas: string }>();
    for (const santri of activeSantriList) {
      const kelasNama = santri.kelasid ? kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas : 'N/A';
      newCache.set(santri.id, {
        namalengkap: santri.namalengkap,
        nomorktt: santri.nomorktt || '-',
        fotoUrl: santri.pasfotourl || null, // Use pasfotourl
        kelas: kelasNama || 'N/A',
      });
    }
    setSantriDetailsCache(newCache);
  }, [activeSantriList, kelasRecords]);


  const handleAttendanceChange = (regId: string, status: AttendanceStatus) => { /* ... (remains the same) ... */ };
  const handleNotesChange = (regId: string, notes: string) => { /* ... (remains the same) ... */ };

  const handleSaveAttendanceAndNotes = (regId: string) => {
    const resultToSave = localResults.get(regId);
    if (resultToSave && resultToSave.iqsamRegistrationId && resultToSave.santriId && resultToSave.iqsamSessionId && resultToSave.kehadiranKeseluruhan) {
       const dataToSubmit: IqsamResultPayload = {
        // id: existingResult?.id || crypto.randomUUID(), // ID handled by Supabase or App.tsx
        iqsamRegistrationId: resultToSave.iqsamRegistrationId,
        santriId: resultToSave.santriId,
        iqsamSessionId: resultToSave.iqsamSessionId,
        kehadiranKeseluruhan: resultToSave.kehadiranKeseluruhan,
        catatanKehadiran: resultToSave.catatanKehadiran,
        scores: resultToSave.scores || [], 
        // lastUpdated: new Date().toISOString(), // Handled by App.tsx or Supabase
      };
      onSaveResult(dataToSubmit);
    } else { /* ... */ }
  };
  
  const getSantriDisplayDetails = (santriId: string) => { /* ... (remains the same) ... */ };
  const isAdminOrSekretariat = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.SEKRETARIAT_SANTRI;
  const isAsatidz = currentUserRole === UserRole.ASATIDZ;
  const sessionKelasNama = kelasRecords.find(k => k.id === iqsamSession.kelasId)?.namaKelas || 'Kelas Tidak Diketahui';

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      {/* ... (UI structure remains the same, photo display will use cached pasfotourl) ... */}
      {iqsamRegistrations.length === 0 ? ( /* ... */ ) : (
        <div className="space-y-4">
          {iqsamRegistrations.map(reg => {
            const santri = getSantriDisplayDetails(reg.santriId);
            // ...
            return (
              <div key={reg.id} className="p-4 border border-slate-300 rounded-lg shadow-sm bg-white">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-shrink-0">
                    {santri.fotoUrl ? <img src={santri.fotoUrl} alt={santri.namalengkap} className="w-16 h-16 object-cover rounded-full shadow" />
                                 : <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center shadow"><UserIcon className="w-10 h-10 text-slate-400" /></div>}
                  </div>
                  {/* ... rest of the row ... */}
                </div>
                {/* ... score and actions ... */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IqsamManageScoresView;
