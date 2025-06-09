
import React, { useState, useEffect, useMemo } from 'react';
import { TamrinExam, TamrinScoreRecord, Santri, AttendanceStatus, UserRole, daftarAttendanceStatus, KelasRecord, SupabaseDefaultFields, User } from '../types'; 
import UserIcon from './icons/UserIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

type TamrinScorePayload = Omit<TamrinScoreRecord, SupabaseDefaultFields>;


interface TamrinManageScoresViewProps {
  tamrinSession: TamrinExam; 
  activeSantriList: Santri[]; 
  tamrinResults: TamrinScoreRecord[]; 
  onSaveBatchResults: (resultsToSave: TamrinScorePayload[]) => void; 
  currentUserRole: UserRole;
  kelasRecords: KelasRecord[];
  asatidzList: User[]; // Added this prop
  pageTitle?: string; 
}

const TamrinManageScoresView: React.FC<TamrinManageScoresViewProps> = ({
  tamrinSession,
  activeSantriList,
  tamrinResults,
  onSaveBatchResults,
  currentUserRole,
  kelasRecords, 
  asatidzList, // Destructure this prop
  pageTitle
}) => {
  const [localResults, setLocalResults] = useState<Map<string, Partial<Omit<TamrinScoreRecord, 'id' | 'created_at' | 'updated_at' | 'tamrinExamId'>>>>(new Map()); 
  const [isSaving, setIsSaving] = useState(false);
  const [santriFotoUrls, setSantriFotoUrls] = useState<Map<string, string | null>>(new Map());

  const isAdminOrAsatidz = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.ASATIDZ;
  const currentExamId = tamrinSession.id; 
  const currentKelasId = tamrinSession.kelasId;

  useEffect(() => {
    const urls = new Map<string, string | null>();
    activeSantriList.forEach(santri => {
      urls.set(santri.id, santri.pasfotourl || null);
    });
    setSantriFotoUrls(urls);
  }, [activeSantriList]);

  const santriInCurrentKelas = useMemo(() => {
    return activeSantriList.filter(s => s.kelasid === currentKelasId)
                           .sort((a,b) => a.namalengkap.localeCompare(b.namalengkap));
  }, [activeSantriList, currentKelasId]);

  useEffect(() => {
    const newMap = new Map<string, Partial<Omit<TamrinScoreRecord, 'id' |'created_at' | 'updated_at' | 'tamrinExamId'>>>();
    santriInCurrentKelas.forEach(santri => {
        const existingResult = tamrinResults.find(r => r.santriId === santri.id && r.tamrinExamId === currentExamId);
        if (existingResult) {
            newMap.set(santri.id, {
                santriId: santri.id,
                kehadiran: existingResult.kehadiran,
                nilaiAngka: existingResult.nilaiAngka,
                nilaiHuruf: existingResult.nilaiHuruf,
                catatan: existingResult.catatan,
                lastUpdatedAt: existingResult.lastUpdatedAt // Preserve existing if any
            });
        } else {
            newMap.set(santri.id, {
                santriId: santri.id,
                kehadiran: AttendanceStatus.HADIR,
                nilaiAngka: undefined,
                nilaiHuruf: undefined,
                catatan: undefined,
                lastUpdatedAt: new Date().toISOString() // Set new for initial creation
            });
        }
    });
    setLocalResults(newMap);
  }, [santriInCurrentKelas, tamrinResults, currentExamId]); 

  const handleFieldChange = (santriId: string, field: keyof Omit<TamrinScoreRecord, 'id' | 'created_at' | 'updated_at' | 'tamrinExamId' | 'santriId'>, value: string | number | AttendanceStatus) => {
    setLocalResults(prev => {
        const newMap = new Map(prev);
        const currentEntry = newMap.get(santriId) || { santriId: santriId, kehadiran: AttendanceStatus.HADIR, lastUpdatedAt: new Date().toISOString() };
        let processedValue = value;
        if (field === 'nilaiAngka' && typeof value === 'string') {
            processedValue = value === '' ? undefined : parseFloat(value);
        }
        newMap.set(santriId, { ...currentEntry, [field]: processedValue, lastUpdatedAt: new Date().toISOString() });
        return newMap;
    });
  };

  const handleSaveAll = () => {
    if (!currentExamId) return;
    setIsSaving(true);
    const resultsToSubmit: TamrinScorePayload[] = []; 
    localResults.forEach((resultData, santriId) => {
      if (currentExamId && resultData.santriId && resultData.kehadiran && resultData.lastUpdatedAt) { 
         resultsToSubmit.push({
          tamrinExamId: currentExamId,
          santriId: resultData.santriId,
          kehadiran: resultData.kehadiran,
          nilaiAngka: resultData.nilaiAngka,
          nilaiHuruf: resultData.nilaiHuruf,
          catatan: resultData.catatan,
          lastUpdatedAt: resultData.lastUpdatedAt,
        });
      }
    });
    
    onSaveBatchResults(resultsToSubmit);
    setTimeout(() => {
        setIsSaving(false);
        alert("Nilai dan kehadiran Tamrin berhasil disimpan!");
    }, 500);
  };
  
  const sessionKelasNama = kelasRecords.find(k => k.id === tamrinSession.kelasId)?.namaKelas || 'Kelas Tidak Diketahui';
  const inputClass = "w-full text-xs px-2 py-1 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm";
  const radioBaseClass = "w-3.5 h-3.5 text-secondary focus:ring-secondary focus:ring-offset-0 form-radio";


  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">
          {pageTitle || `Kelola Nilai & Kehadiran Tamrin`}
        </h2>
        <p className="text-sm text-base-content/70">
          Tamrin: {tamrinSession.namaTamrin} - Kelas: {sessionKelasNama} - Asatidz: {asatidzList.find(a => a.id === tamrinSession.asatidzId)?.namaLengkap || 'N/A'}
        </p>
        <p className="text-xs text-slate-500">Tanggal Pelaksanaan: {new Date(tamrinSession.tanggalPelaksanaan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
       {santriInCurrentKelas.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow">
            <InformationCircleIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
            <h3 className="text-xl font-semibold text-neutral-content">Tidak Ada Santri di Kelas Ini</h3>
            <p className="mt-1 text-sm text-base-content/70">Tidak ada santri aktif yang terdaftar di kelas yang terkait dengan Tamrin ini.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow border border-base-300">
            <table className="min-w-full divide-y divide-base-300">
              <thead className="bg-base-200">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-2/6">Santri</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/6">Kehadiran</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/6">Nilai Angka</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-2/6">Catatan</th>
                </tr>
              </thead>
              <tbody className="bg-base-100 divide-y divide-slate-200">
                {santriInCurrentKelas.map(santri => {
                  const result = localResults.get(santri.id);
                  const fotoUrl = santriFotoUrls.get(santri.id);
                  return (
                    <tr key={santri.id} className="hover:bg-base-200/30 transition-colors">
                      <td className="px-3 py-3 align-top">
                        <div className="flex items-center gap-2">
                           <div className="flex-shrink-0"> {fotoUrl ? <img src={fotoUrl} alt={santri.namalengkap} className="w-8 h-8 object-cover rounded-full shadow" /> : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow"><UserIcon className="w-5 h-5 text-slate-400" /></div>}</div>
                           <div className="text-xs">
                            <p className="font-medium text-neutral-content">{santri.namalengkap}</p>
                            <p className="text-slate-500">{santri.nomorktt || '-'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <select 
                            value={result?.kehadiran || AttendanceStatus.HADIR} 
                            onChange={e => handleFieldChange(santri.id, 'kehadiran', e.target.value as AttendanceStatus)} 
                            className={`${inputClass} py-1`}
                            disabled={!isAdminOrAsatidz}
                        >
                            {daftarAttendanceStatus.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <input 
                            type="number" 
                            value={result?.nilaiAngka === undefined ? '' : result.nilaiAngka} 
                            onChange={e => handleFieldChange(santri.id, 'nilaiAngka', e.target.value)} 
                            className={`${inputClass} py-1`} 
                            placeholder="0-100"
                            disabled={!isAdminOrAsatidz || result?.kehadiran !== AttendanceStatus.HADIR}
                            min="0" max="100" step="0.1"
                        />
                      </td>
                      <td className="px-3 py-3 align-top">
                        <input 
                            type="text" 
                            value={result?.catatan || ''} 
                            onChange={e => handleFieldChange(santri.id, 'catatan', e.target.value)} 
                            className={`${inputClass} py-1`} 
                            placeholder="Catatan singkat..."
                            disabled={!isAdminOrAsatidz}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isAdminOrAsatidz && (
            <div className="pt-4 border-t border-base-300 flex justify-end">
                <button 
                onClick={handleSaveAll} 
                disabled={isSaving} 
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                {isSaving ? ( <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Menyimpan...</> ) : ( <><CheckCircleIcon className="w-5 h-5" />Simpan Semua Nilai & Kehadiran</> )}
                </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TamrinManageScoresView;
