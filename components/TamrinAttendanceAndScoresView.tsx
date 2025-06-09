
import React, { useState, useEffect, useMemo } from 'react';
import { TamrinExam, TamrinScoreRecord, Santri, AttendanceStatus, UserRole, daftarAttendanceStatus, KelasRecord, AppwriteDocument } from '../types'; // Updated imports
import UserIcon from './icons/UserIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import { storage as appwriteStorage, APPWRITE_BUCKET_ID_SANTRI_PHOTOS } from '../services/appwriteClient';

type TamrinScorePayload = Omit<TamrinScoreRecord, keyof AppwriteDocument>;

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
    const fetchFotoUrls = async () => {
      const urls = new Map<string, string | null>();
      for (const santri of activeSantriList) {
        if (santri.pasFotoFileId) {
          try {
            const url = appwriteStorage.getFilePreview(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, santri.pasFotoFileId);
            urls.set(santri.id, url.toString());
          } catch (error) {
            console.error(`Error fetching photo for ${santri.namalengkap}:`, error);
            urls.set(santri.id, null);
          }
        } else {
          urls.set(santri.id, null);
        }
      }
      setSantriFotoUrls(urls);
    };

    if (activeSantriList.length > 0) {
      fetchFotoUrls();
    }
  }, [activeSantriList]);

  useEffect(() => {
    const newMap = new Map<string, Partial<Omit<TamrinScoreRecord, 'id' | 'lastUpdatedAt' | 'tamrinExamId'>>>(); 
    activeSantriList.forEach(santri => {
      const existingResult = tamrinResults.find(r => r.santriId === santri.id && r.tamrinExamId === currentExamId);
      if (existingResult) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, id, lastUpdatedAt, tamrinExamId, ...scoreValues } = existingResult;
        newMap.set(santri.id, scoreValues);
      } else {
        newMap.set(santri.id, {
          santriId: santri.id,
          kehadiran: AttendanceStatus.HADIR,
          nilaiAngka: undefined,
          nilaiHuruf: undefined,
          catatan: undefined,
        });
      }
    });
    setLocalResults(newMap);
  }, [activeSantriList, tamrinResults, currentExamId]); 

  const handleFieldChange = (santriId: string, field: keyof Omit<TamrinScoreRecord, 'id' | 'lastUpdatedAt' | 'tamrinExamId' | 'santriId'>, value: string | number | AttendanceStatus) => { 
    setLocalResults(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(santriId);
      if (current) {
        let processedValue = value;
        if (field === 'nilaiAngka' && typeof value === 'string') {
            processedValue = value === '' ? undefined : parseFloat(value);
        }
        newMap.set(santriId, { ...current, [field]: processedValue });
      }
      return newMap;
    });
  };

  const handleSaveAll = () => {
    if (!currentExamId) return;
    setIsSaving(true);
    const resultsToSubmit: TamrinScorePayload[] = []; 
    localResults.forEach((resultData, santriId) => {
      if (currentExamId && resultData.santriId && resultData.kehadiran) { 
         resultsToSubmit.push({
          id: tamrinResults.find(r => r.santriId === santriId && r.tamrinExamId === currentExamId)?.id || crypto.randomUUID(), 
          tamrinExamId: currentExamId,
          santriId: resultData.santriId!,
          kehadiran: resultData.kehadiran!,
          nilaiAngka: resultData.nilaiAngka,
          nilaiHuruf: resultData.nilaiHuruf,
          catatan: resultData.catatan,
          lastUpdatedAt: new Date().toISOString(),
        });
      }
    });
    
    onSaveBatchResults(resultsToSubmit);
    setTimeout(() => {
        setIsSaving(false);
        alert("Data Tamrin berhasil disimpan!");
    }, 500);
  };
  
  const sessionKelasNama = kelasRecords.find(k => k.id === tamrinSession.kelasId)?.namaKelas || 'Kelas Tidak Diketahui';

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">Kelola Nilai & Kehadiran Tamrin</h2>
        <p className="text-sm text-base-content/70">Sesi: <span className="font-semibold text-secondary">{tamrinSession.namaTamrin}</span> | Kelas: <span className="font-semibold text-secondary">{sessionKelasNama}</span></p>
        <p className="text-xs text-slate-500">Tanggal Pelaksanaan: {new Date(tamrinSession.tanggalPelaksanaan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {activeSantriList.length === 0 ? (
         <div className="text-center py-12 bg-base-200 rounded-lg shadow">
            <InformationCircleIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
            <h3 className="text-xl font-semibold text-neutral-content">Tidak Ada Santri di Kelas Ini</h3>
            <p className="mt-1 text-sm text-base-content/70">Tidak ada santri aktif yang terdaftar di kelas yang terkait dengan sesi Tamrin ini.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow border border-base-300">
            <table className="min-w-full divide-y divide-base-300">
              <thead className="bg-base-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/4">Santri</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/4">Kehadiran</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/8">Nilai (Angka)</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/8">Nilai (Huruf)</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/4">Catatan</th>
                </tr>
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
                           <div><p className="text-sm font-medium text-neutral-content">{santri.namalengkap}</p><p className="text-xs text-slate-500">{santri.nomorktt || '-'}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <select 
                            value={result?.kehadiran || AttendanceStatus.HADIR} 
                            onChange={(e) => handleFieldChange(santri.id, 'kehadiran', e.target.value as AttendanceStatus)}
                            className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm"
                            disabled={!isAdminOrAsatidz}
                        >
                          {daftarAttendanceStatus.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <input type="number" value={result?.nilaiAngka === undefined ? '' : result.nilaiAngka} onChange={(e) => handleFieldChange(santri.id, 'nilaiAngka', e.target.value)} className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm" placeholder="0-100" disabled={!isAdminOrAsatidz || result?.kehadiran !== AttendanceStatus.HADIR}/>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <input type="text" value={result?.nilaiHuruf || ''} onChange={(e) => handleFieldChange(santri.id, 'nilaiHuruf', e.target.value)} className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm" placeholder="A/B/C" disabled={!isAdminOrAsatidz || result?.kehadiran !== AttendanceStatus.HADIR}/>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <input type="text" value={result?.catatan || ''} onChange={(e) => handleFieldChange(santri.id, 'catatan', e.target.value)} className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm" placeholder="Catatan singkat..." disabled={!isAdminOrAsatidz}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isAdminOrAsatidz && (
            <div className="pt-6 border-t border-base-300 flex justify-end">
              <button onClick={handleSaveAll} disabled={isSaving} className="flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50">
                {isSaving ? (<><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Menyimpan...</>) : (<><CheckCircleIcon className="w-5 h-5" />Simpan Semua Perubahan</>)}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TamrinManageScoresView;
