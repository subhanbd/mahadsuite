
import React, { useState, useEffect, useMemo } from 'react';
import { TamrinExam, TamrinScoreRecord, Santri, AttendanceStatus, UserRole, daftarAttendanceStatus, KelasRecord } from '../types'; 
import UserIcon from './icons/UserIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
// No Appwrite storage import

type TamrinScorePayload = Omit<TamrinScoreRecord, 'id' | 'created_at' | 'lastUpdatedAt'>;


interface TamrinManageScoresViewProps {
  tamrinSession: TamrinExam; 
  activeSantriList: Santri[]; 
  tamrinResults: TamrinScoreRecord[]; 
  onSaveBatchResults: (resultsToSave: TamrinScorePayload[]) => void; 
  currentUserRole: UserRole;
  kelasRecords: KelasRecord[]; 
  pageTitle?: string; 
}

const TamrinManageScoresView: React.FC<TamrinManageScoresViewProps> = ({
  tamrinSession,
  activeSantriList,
  tamrinResults,
  onSaveBatchResults,
  currentUserRole,
  kelasRecords, 
  pageTitle
}) => {
  const [localResults, setLocalResults] = useState<Map<string, Partial<Omit<TamrinScoreRecord, 'id' | 'lastUpdatedAt' | 'tamrinExamId'>>>>(new Map()); 
  const [isSaving, setIsSaving] = useState(false);
  const [santriFotoUrls, setSantriFotoUrls] = useState<Map<string, string | null>>(new Map());

  const isAdminOrAsatidz = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.ASATIDZ;
  const currentExamId = tamrinSession.id; 

  useEffect(() => {
    // Santri photos are now directly in activeSantriList as pasfotourl
    const urls = new Map<string, string | null>();
    activeSantriList.forEach(santri => {
      urls.set(santri.id, santri.pasfotourl || null);
    });
    setSantriFotoUrls(urls);
  }, [activeSantriList]);

  useEffect(() => {
    // Initialize localResults (remains the same)
    const newMap = new Map<string, Partial<Omit<TamrinScoreRecord, 'id' | 'lastUpdatedAt' | 'tamrinExamId'>>>(); 
    activeSantriList.forEach(santri => { /* ... */ });
    setLocalResults(newMap);
  }, [activeSantriList, tamrinResults, currentExamId]); 

  const handleFieldChange = (santriId: string, field: keyof Omit<TamrinScoreRecord, 'id' | 'lastUpdatedAt' | 'tamrinExamId' | 'santriId'>, value: string | number | AttendanceStatus) => { /* ... (remains the same) ... */ };

  const handleSaveAll = () => {
    if (!currentExamId) return;
    setIsSaving(true);
    const resultsToSubmit: TamrinScorePayload[] = []; 
    localResults.forEach((resultData, santriId) => {
      if (currentExamId && resultData.santriId && resultData.kehadiran) { 
         resultsToSubmit.push({
          // id: tamrinResults.find(r => r.santriId === santriId && r.tamrinExamId === currentExamId)?.id || crypto.randomUUID(), // Handled by App.tsx/Supabase
          tamrinExamId: currentExamId,
          santriId: resultData.santriId!,
          kehadiran: resultData.kehadiran!,
          nilaiAngka: resultData.nilaiAngka,
          nilaiHuruf: resultData.nilaiHuruf,
          catatan: resultData.catatan,
          // lastUpdatedAt: new Date().toISOString(), // Handled by App.tsx
        });
      }
    });
    
    onSaveBatchResults(resultsToSubmit);
    setTimeout(() => { /* ... */ }, 500);
  };
  
  const sessionKelasNama = kelasRecords.find(k => k.id === tamrinSession.kelasId)?.namaKelas || 'Kelas Tidak Diketahui';

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      {/* ... (UI structure remains the same, photo display will use cached pasfotourl) ... */}
       {activeSantriList.length === 0 ? ( /* ... */ ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow border border-base-300">
            <table className="min-w-full divide-y divide-base-300">
              <thead className="bg-base-200">
                {/* ... table headers ... */}
              </thead>
              <tbody className="bg-base-100 divide-y divide-slate-200">
                {activeSantriList.map(santri => {
                  const result = localResults.get(santri.id);
                  const fotoUrl = santriFotoUrls.get(santri.id);
                  return (
                    <tr key={santri.id} className="hover:bg-base-200/30 transition-colors">
                      <td className="px-3 py-3 align-top">
                        <div className="flex items-center gap-2">
                           <div className="flex-shrink-0"> {fotoUrl ? <img src={fotoUrl} alt={santri.namalengkap} className="w-8 h-8 object-cover rounded-full shadow" /> : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow"><UserIcon className="w-5 h-5 text-slate-400" /></div>}</div>
                           {/* ... rest of santri name ... */}
                        </div>
                      </td>
                      {/* ... rest of table cells ... */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* ... save button ... */}
        </>
      )}
    </div>
  );
};

export default TamrinManageScoresView;
