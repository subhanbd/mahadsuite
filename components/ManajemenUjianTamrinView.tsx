
import React, { useState, useMemo, useEffect } from 'react';
import { Santri, KelasRecord, User, TamrinExam, TamrinScoreRecord, AttendanceStatus, UserRole, daftarAttendanceStatus, TamrinExamPayload, TamrinScorePayload, SupabaseDefaultFields } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import PencilIcon from './icons/PencilIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import UserIcon from './icons/UserIcon'; 
import TamrinSessionFormModal from './TamrinSessionFormModal'; // Assuming this will be created or exists

interface ManajemenUjianTamrinViewProps {
  activeSantriList: Santri[];
  kelasRecords: KelasRecord[];
  asatidzList: User[]; // Users with Asatidz role
  tamrinExams: TamrinExam[];
  tamrinScoreRecords: TamrinScoreRecord[];
  onSaveExam: (exam: TamrinExamPayload, existingExamId?: string) => string;
  onSaveScores: (scores: TamrinScorePayload[]) => void;
  onDeleteExamAndScores: (examId: string) => void;
  currentUserRole: UserRole;
}

const ManajemenUjianTamrinView: React.FC<ManajemenUjianTamrinViewProps> = ({
  activeSantriList,
  kelasRecords,
  asatidzList,
  tamrinExams,
  tamrinScoreRecords,
  onSaveExam,
  onSaveScores,
  onDeleteExamAndScores,
  currentUserRole,
}) => {
  const [selectedKelasIdForm, setSelectedKelasIdForm] = useState<string>(kelasRecords.length > 0 ? kelasRecords[0].id : '');
  const [selectedAsatidzIdForm, setSelectedAsatidzIdForm] = useState<string>(asatidzList.length > 0 ? asatidzList[0].id : '');
  const [namaTamrinForm, setNamaTamrinForm] = useState<string>('');
  const [tanggalPelaksanaanForm, setTanggalPelaksanaanForm] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deskripsiTamrinForm, setDeskripsiTamrinForm] = useState<string>('');
  const [examToEdit, setExamToEdit] = useState<TamrinExam | null>(null);
  const [isSessionFormModalOpen, setIsSessionFormModalOpen] = useState(false);

  const [currentExamIdForScores, setCurrentExamIdForScores] = useState<string | null>(null);
  const [currentScores, setCurrentScores] = useState<Map<string, Partial<Omit<TamrinScoreRecord, 'id' | 'tamrinExamId' | 'created_at' | 'updated_at'>>>>(new Map());
  const [isLoadingExamForScores, setIsLoadingExamForScores] = useState(false);
  const [isSavingScores, setIsSavingScores] = useState(false);

  const canManage = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.ASATIDZ || currentUserRole === UserRole.SEKRETARIAT_SANTRI;
  const isAdminOrAsatidz = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.ASATIDZ;


  const santriInCurrentKelasForScores = useMemo(() => {
    const exam = tamrinExams.find(ex => ex.id === currentExamIdForScores);
    if (!exam) return [];
    return activeSantriList.filter(s => s.kelasid === exam.kelasId)
                           .sort((a,b) => a.namalengkap.localeCompare(b.namalengkap));
  }, [activeSantriList, currentExamIdForScores, tamrinExams]);

  useEffect(() => {
    if (!currentExamIdForScores) {
        setCurrentScores(new Map());
        return;
    }
    const newScoresMap = new Map<string, Partial<Omit<TamrinScoreRecord, 'id' |'created_at' | 'updated_at' | 'tamrinExamId'>>>();
    santriInCurrentKelasForScores.forEach(santri => {
        const existingScoreRecord = tamrinScoreRecords.find(
            score => score.tamrinExamId === currentExamIdForScores && score.santriId === santri.id
        );
        if (existingScoreRecord) {
            newScoresMap.set(santri.id, {
                santriId: santri.id,
                kehadiran: existingScoreRecord.kehadiran,
                nilaiAngka: existingScoreRecord.nilaiAngka,
                nilaiHuruf: existingScoreRecord.nilaiHuruf,
                catatan: existingScoreRecord.catatan,
                lastUpdatedAt: existingScoreRecord.lastUpdatedAt
            });
        } else {
             newScoresMap.set(santri.id, {
                santriId: santri.id,
                kehadiran: AttendanceStatus.HADIR,
                nilaiAngka: undefined,
                nilaiHuruf: undefined,
                catatan: undefined,
                lastUpdatedAt: new Date().toISOString()
            });
        }
    });
    setCurrentScores(newScoresMap);
  }, [currentExamIdForScores, santriInCurrentKelasForScores, tamrinScoreRecords]);


  const handleSaveExamFromForm = (examData: TamrinExamPayload, existingExamId?: string) => {
    const savedExamId = onSaveExam(examData, existingExamId);
    setIsSessionFormModalOpen(false);
    setExamToEdit(null);
    // If it's a new exam, or the one being edited is the one currently open for scores, refresh scores view.
    if (!existingExamId || existingExamId === currentExamIdForScores) {
        setCurrentExamIdForScores(savedExamId); // This will trigger useEffect to load scores
    }
  };

  const handleOpenAddSessionModal = () => {
    setExamToEdit(null);
    setIsSessionFormModalOpen(true);
  };
  const handleOpenEditSessionModal = (session: TamrinExam) => {
    setExamToEdit(session);
    setIsSessionFormModalOpen(true);
  };
  const handleDeleteSession = (sessionId: string) => {
    if(window.confirm("Apakah Anda yakin ingin menghapus sesi Tamrin ini beserta semua nilainya?")){
      onDeleteExamAndScores(sessionId);
      if(currentExamIdForScores === sessionId) {
        setCurrentExamIdForScores(null); // Clear score view if deleted exam was active
      }
    }
  };
  
  const handleNavigateToScores = (sessionId: string) => {
    setIsLoadingExamForScores(true);
    setCurrentExamIdForScores(sessionId);
    // Data loading is handled by useEffect watching currentExamIdForScores
    setTimeout(() => setIsLoadingExamForScores(false), 300); // Simulate data fetch
  };

  const handleFieldChangeForScore = (santriId: string, field: keyof Omit<TamrinScoreRecord, 'id' | 'created_at' | 'updated_at' | 'tamrinExamId' | 'santriId'>, value: string | number | AttendanceStatus) => {
    setCurrentScores(prev => {
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

  const handleSaveAllScores = () => {
    if (!currentExamIdForScores) return;
    setIsSavingScores(true);
    const scoresToSubmit: TamrinScorePayload[] = [];
    currentScores.forEach((scoreData) => {
      if (scoreData.santriId && scoreData.kehadiran && scoreData.lastUpdatedAt) {
         scoresToSubmit.push({
          tamrinExamId: currentExamIdForScores,
          santriId: scoreData.santriId,
          kehadiran: scoreData.kehadiran,
          nilaiAngka: scoreData.nilaiAngka,
          nilaiHuruf: scoreData.nilaiHuruf,
          catatan: scoreData.catatan,
          lastUpdatedAt: scoreData.lastUpdatedAt,
        });
      }
    });
    
    onSaveScores(scoresToSubmit);
    setTimeout(() => {
        setIsSavingScores(false);
        alert("Nilai dan kehadiran Tamrin berhasil disimpan!");
    }, 500);
  };

  const currentTamrinExamForScores = useMemo(() => tamrinExams.find(ex => ex.id === currentExamIdForScores), [currentExamIdForScores, tamrinExams]);
  
  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90 mb-1";
  const scoreInputClass = "w-full text-xs px-2 py-1 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm disabled:bg-slate-100 disabled:text-slate-400";

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">Manajemen Ujian Tamrin</h2>
        <p className="text-sm text-base-content/70">Kelola sesi Tamrin, input nilai dan kehadiran santri.</p>
      </div>
      
      {/* Tamrin Sessions List */}
       <section className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-neutral-content">Daftar Sesi Tamrin</h3>
            {canManage && (
                <button 
                    onClick={handleOpenAddSessionModal} 
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm"
                >
                    <PlusIcon className="w-4 h-4"/> Tambah Sesi Baru
                </button>
            )}
        </div>
        {tamrinExams.length === 0 ? (
            <div className="text-center py-8 bg-base-200/50 rounded-lg shadow">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-neutral-content font-semibold">Belum ada sesi Tamrin.</p>
                {canManage && <p className="text-sm text-base-content/70">Silakan tambahkan sesi baru.</p>}
            </div>
        ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-base-300">
                <table className="min-w-full divide-y divide-base-300">
                    <thead className="bg-base-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-content">Nama Tamrin</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-content">Kelas</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-content">Asatidz</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-content">Tanggal</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-content">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 divide-y divide-base-200">
                        {tamrinExams.sort((a,b) => new Date(b.tanggalPelaksanaan).getTime() - new Date(a.tanggalPelaksanaan).getTime()).map(session => (
                            <tr key={session.id} className="hover:bg-base-200/30">
                                <td className="px-4 py-3 text-sm font-medium text-neutral-content">{session.namaTamrin}</td>
                                <td className="px-4 py-3 text-sm text-base-content">{kelasRecords.find(k => k.id === session.kelasId)?.namaKelas || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-base-content">{asatidzList.find(a => a.id === session.asatidzId)?.namaLengkap || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-base-content">{new Date(session.tanggalPelaksanaan).toLocaleDateString('id-ID')}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button onClick={() => handleNavigateToScores(session.id)} className="p-1.5 text-sky-600 hover:text-sky-800 bg-sky-100 hover:bg-sky-200 rounded-md shadow-sm" title="Kelola Nilai & Kehadiran">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        {canManage && (
                                            <>
                                            <button onClick={() => handleOpenEditSessionModal(session)} className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-md shadow-sm" title="Edit Sesi">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteSession(session.id)} className="p-1.5 text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded-md shadow-sm" title="Hapus Sesi">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </section>

      {/* Scores Input Section */}
      {currentExamIdForScores && currentTamrinExamForScores && (
        <section className="pt-6 border-t border-base-300">
          <h3 className="text-xl font-semibold text-neutral-content mb-2">
            Input Nilai & Kehadiran: {currentTamrinExamForScores.namaTamrin}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Kelas: {kelasRecords.find(k => k.id === currentTamrinExamForScores.kelasId)?.namaKelas || 'N/A'} | 
            Asatidz: {asatidzList.find(a => a.id === currentTamrinExamForScores.asatidzId)?.namaLengkap || 'N/A'} | 
            Tanggal: {new Date(currentTamrinExamForScores.tanggalPelaksanaan).toLocaleDateString('id-ID')}
          </p>

          {isLoadingExamForScores ? (
            <div className="text-center py-8"><span className="loading loading-dots loading-lg text-secondary"></span> Memuat data nilai...</div>
          ) : santriInCurrentKelasForScores.length === 0 ? (
            <div className="text-center py-8 bg-base-200/50 rounded-lg shadow">
              <InformationCircleIcon className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-neutral-content font-semibold">Tidak ada santri di kelas ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-base-300">
              <table className="min-w-full divide-y divide-base-300">
                <thead className="bg-base-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-2/5">Santri</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/5">Kehadiran</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/5">Nilai</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-content w-1/5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="bg-base-100 divide-y divide-base-200">
                  {santriInCurrentKelasForScores.map(santri => {
                    const score = currentScores.get(santri.id);
                    const isHadir = score?.kehadiran === AttendanceStatus.HADIR;
                    return (
                      <tr key={santri.id} className="hover:bg-base-200/30">
                        <td className="px-3 py-2 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              {santri.pasfotourl ? <img src={santri.pasfotourl} alt={santri.namalengkap} className="w-8 h-8 object-cover rounded-full shadow" />
                                                 : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow"><UserIcon className="w-5 h-5 text-slate-400" /></div>}
                            </div>
                            <div className="text-xs">
                              <p className="font-medium text-neutral-content">{santri.namalengkap}</p>
                              <p className="text-slate-500">{santri.nomorktt || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <select
                            value={score?.kehadiran || AttendanceStatus.HADIR}
                            onChange={e => handleFieldChangeForScore(santri.id, 'kehadiran', e.target.value as AttendanceStatus)}
                            className={`${scoreInputClass} py-1`}
                            disabled={!isAdminOrAsatidz}
                          >
                            {daftarAttendanceStatus.map(status => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <input
                            type="number"
                            value={score?.nilaiAngka === undefined ? '' : score.nilaiAngka}
                            onChange={e => handleFieldChangeForScore(santri.id, 'nilaiAngka', e.target.value)}
                            className={`${scoreInputClass} py-1`}
                            placeholder="0-100"
                            disabled={!isAdminOrAsatidz || !isHadir}
                            min="0" max="100" step="0.1"
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <input
                            type="text"
                            value={score?.catatan || ''}
                            onChange={e => handleFieldChangeForScore(santri.id, 'catatan', e.target.value)}
                            className={`${scoreInputClass} py-1`}
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
          )}
          {isAdminOrAsatidz && santriInCurrentKelasForScores.length > 0 && (
             <div className="pt-4 mt-4 border-t border-base-300 flex justify-end">
                <button 
                onClick={handleSaveAllScores} 
                disabled={isSavingScores} 
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                {isSavingScores ? ( <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Menyimpan...</> ) : ( <><CheckCircleIcon className="w-5 h-5" />Simpan Semua</> )}
                </button>
            </div>
          )}
        </section>
      )}

      {isSessionFormModalOpen && (
        <TamrinSessionFormModal
          isOpen={isSessionFormModalOpen}
          onClose={() => setIsSessionFormModalOpen(false)}
          onSubmit={handleSaveExamFromForm}
          initialData={examToEdit}
          kelasRecords={kelasRecords}
          asatidzList={asatidzList}
        />
      )}

    </div>
  );
};

export default ManajemenUjianTamrinView;
