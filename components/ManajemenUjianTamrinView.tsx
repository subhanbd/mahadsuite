
import React, { useState, useMemo, useEffect } from 'react';
import { Santri, KelasRecord, User, TamrinExam, TamrinScoreRecord, AttendanceStatus, UserRole, daftarAttendanceStatus, TamrinExamPayload, TamrinScorePayload } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

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
  const [selectedKelasId, setSelectedKelasId] = useState<string>(kelasRecords.length > 0 ? kelasRecords[0].id : '');
  const [selectedAsatidzId, setSelectedAsatidzId] = useState<string>(asatidzList.length > 0 ? asatidzList[0].id : '');
  const [namaTamrin, setNamaTamrin] = useState<string>('');
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deskripsiTamrin, setDeskripsiTamrin] = useState<string>('');

  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [currentScores, setCurrentScores] = useState<Map<string, Partial<Omit<TamrinScoreRecord, 'id' | 'lastUpdatedAt' | 'tamrinExamId'>>>>(new Map());
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const [isSavingScores, setIsSavingScores] = useState(false);

  // Rekapitulasi State
  const [rekapKelasId, setRekapKelasId] = useState<string>('');
  const [rekapAsatidzId, setRekapAsatidzId] = useState<string>('');
  const [rekapNamaTamrin, setRekapNamaTamrin] = useState<string>('');

  const canManage = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.ASATIDZ || currentUserRole === UserRole.SEKRETARIAT_SANTRI;

  useEffect(() => {
    setCurrentExamId(null);
    setCurrentScores(new Map());
  }, [selectedKelasId, selectedAsatidzId, namaTamrin, tanggalPelaksanaan]);

  const handleLoadOrCreateExam = () => {
    if (!selectedKelasId || !selectedAsatidzId || !namaTamrin.trim()) {
      alert("Mohon lengkapi Kelas, Asatidz, dan Nama Tamrin.");
      return;
    }
    setIsLoadingExam(true);
    const existingExam = tamrinExams.find(ex => 
      ex.kelasId === selectedKelasId &&
      ex.asatidzId === selectedAsatidzId &&
      ex.namaTamrin.toLowerCase() === namaTamrin.toLowerCase().trim() &&
      ex.tanggalPelaksanaan === tanggalPelaksanaan
    );

    if (existingExam) {
      setCurrentExamId(existingExam.id);
      loadScoresForExam(existingExam.id);
    } else {
      if (canManage) {
        const newExamData: TamrinExamPayload = { kelasId: selectedKelasId, asatidzId: selectedAsatidzId, namaTamrin: namaTamrin.trim(), tanggalPelaksanaan, deskripsi: deskripsiTamrin.trim() || undefined };
        const newExamId = onSaveExam(newExamData);
        setCurrentExamId(newExamId);
        loadScoresForExam(newExamId);
      } else {
        alert("Ujian Tamrin tidak ditemukan. Hanya role tertentu yang bisa membuat ujian baru.");
      }
    }
    setIsLoadingExam(false);
  };

  const loadScoresForExam = (examId: string) => {
    const santriInClass = activeSantriList.filter(s => s.kelasid === selectedKelasId);
    const newScoresMap = new Map<string, Partial<Omit<TamrinScoreRecord, 'id' | 'lastUpdatedAt' | 'tamrinExamId'>>>();
    santriInClass.forEach(santri => {
      const existingScore = tamrinScoreRecords.find(sr => sr.tamrinExamId === examId && sr.santriId === santri.id);
      if (existingScore) {
        newScoresMap.set(santri.id, { ...existingScore });
      } else {
        newScoresMap.set(santri.id, { santriId: santri.id, kehadiran: AttendanceStatus.HADIR, nilaiAngka: undefined, catatan: undefined });
      }
    });
    setCurrentScores(newScoresMap);
  };

  const handleScoreChange = (santriId: string, field: keyof Omit<TamrinScoreRecord, 'id' | 'lastUpdatedAt' | 'tamrinExamId' | 'santriId'>, value: string | number | AttendanceStatus) => {
    setCurrentScores(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(santriId) || { santriId, kehadiran: AttendanceStatus.HADIR };
      let processedValue = value;
      if (field === 'nilaiAngka' && typeof value === 'string') {
        processedValue = value === '' ? undefined : parseFloat(value);
      }
      newMap.set(santriId, { ...current, [field]: processedValue });
      return newMap;
    });
  };

  const handleSaveAllScores = () => {
    if (!currentExamId) return;
    setIsSavingScores(true);
    const scoresToSave: TamrinScorePayload[] = [];
    currentScores.forEach((scoreData, santriId) => {
      scoresToSave.push({
        // id: tamrinScoreRecords.find(sr => sr.tamrinExamId === currentExamId && sr.santriId === santriId)?.id || crypto.randomUUID(), // Appwrite will generate ID
        tamrinExamId: currentExamId,
        santriId,
        kehadiran: scoreData.kehadiran || AttendanceStatus.HADIR,
        nilaiAngka: scoreData.nilaiAngka,
        nilaiHuruf: scoreData.nilaiHuruf,
        catatan: scoreData.catatan,
        lastUpdatedAt: new Date().toISOString(),
      });
    });
    onSaveScores(scoresToSave);
     setTimeout(() => {
        setIsSavingScores(false);
        alert("Nilai dan kehadiran Tamrin berhasil disimpan!");
    }, 500);
  };
  
  const handleDeleteCurrentExam = () => {
    if (currentExamId && canManage) {
      if (confirm(`Apakah Anda yakin ingin menghapus data Tamrin "${namaTamrin}" untuk kelas ini beserta semua nilainya?`)) {
        onDeleteExamAndScores(currentExamId);
        setCurrentExamId(null);
        setCurrentScores(new Map());
        setNamaTamrin(''); 
      }
    }
  };

  const filteredRekapScores = useMemo(() => {
    return tamrinScoreRecords.filter(sr => {
      const exam = tamrinExams.find(ex => ex.id === sr.tamrinExamId);
      if (!exam) return false;
      if (rekapKelasId && exam.kelasId !== rekapKelasId) return false;
      if (rekapAsatidzId && exam.asatidzId !== rekapAsatidzId) return false;
      if (rekapNamaTamrin && !exam.namaTamrin.toLowerCase().includes(rekapNamaTamrin.toLowerCase())) return false;
      return true;
    }).map(sr => {
      const exam = tamrinExams.find(ex => ex.id === sr.tamrinExamId);
      const santri = activeSantriList.find(s => s.id === sr.santriId);
      const kelas = kelasRecords.find(k => k.id === exam?.kelasId);
      const asatidz = asatidzList.find(a => a.id === exam?.asatidzId);
      return {
        ...sr,
        namaSantri: santri?.namalengkap || 'N/A',
        nomorKTT: santri?.nomorktt || '-',
        namaKelas: kelas?.namaKelas || 'N/A',
        namaTamrin: exam?.namaTamrin || 'N/A',
        namaAsatidz: asatidz?.namaLengkap || 'N/A',
        tanggalPelaksanaan: exam?.tanggalPelaksanaan,
      };
    }).sort((a,b) => (a.namaSantri.localeCompare(b.namaSantri)) || (new Date(b.tanggalPelaksanaan || 0).getTime() - new Date(a.tanggalPelaksanaan || 0).getTime()));
  }, [tamrinScoreRecords, tamrinExams, rekapKelasId, rekapAsatidzId, rekapNamaTamrin, activeSantriList, kelasRecords, asatidzList]);

   const santriForCurrentExam = useMemo(() => {
    if (!currentExamId || !selectedKelasId) return [];
    return activeSantriList.filter(s => s.kelasid === selectedKelasId)
                           .sort((a,b) => a.namalengkap.localeCompare(b.namalengkap));
  }, [currentExamId, selectedKelasId, activeSantriList]);


  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm";
  const labelClass = "block text-sm font-medium text-neutral-content/90 mb-1";

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-1">Ujian Tamrin</h2>
        <p className="text-sm text-base-content/70">Definisikan Tamrin, input nilai dan kehadiran santri, atau lihat rekapitulasi.</p>
      </div>

      {/* Tamrin Definition Section */}
      <section className="p-4 bg-base-200/50 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold text-neutral-content">Definisi Ujian Tamrin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label htmlFor="namaTamrin" className={labelClass}>Nama Tamrin <span className="text-red-500">*</span></label><input type="text" id="namaTamrin" value={namaTamrin} onChange={e => setNamaTamrin(e.target.value)} className={inputClass} placeholder="Cth: UH Fiqh Bab Wudhu" disabled={!canManage && !!currentExamId}/></div>
          <div><label htmlFor="selectedKelasIdTamrin" className={labelClass}>Kelas <span className="text-red-500">*</span></label><select id="selectedKelasIdTamrin" value={selectedKelasId} onChange={e => setSelectedKelasId(e.target.value)} className={inputClass} disabled={!canManage && !!currentExamId}>{kelasRecords.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
          <div><label htmlFor="selectedAsatidzId" className={labelClass}>Asatidz <span className="text-red-500">*</span></label><select id="selectedAsatidzId" value={selectedAsatidzId} onChange={e => setSelectedAsatidzId(e.target.value)} className={inputClass} disabled={!canManage && !!currentExamId}>{asatidzList.map(a => <option key={a.id} value={a.id}>{a.namaLengkap}</option>)}</select></div>
          <div><label htmlFor="tanggalPelaksanaanTamrin" className={labelClass}>Tgl Pelaksanaan <span className="text-red-500">*</span></label><input type="date" id="tanggalPelaksanaanTamrin" value={tanggalPelaksanaan} onChange={e => setTanggalPelaksanaan(e.target.value)} className={inputClass} disabled={!canManage && !!currentExamId}/></div>
          <div className="lg:col-span-2"><label htmlFor="deskripsiTamrin" className={labelClass}>Deskripsi (Opsional)</label><input type="text" id="deskripsiTamrin" value={deskripsiTamrin} onChange={e => setDeskripsiTamrin(e.target.value)} className={inputClass} placeholder="Materi atau catatan Tamrin" disabled={!canManage && !!currentExamId}/></div>
        </div>
         {canManage && (
            <div className="flex justify-end gap-3 pt-3">
                {currentExamId && (
                    <button onClick={handleDeleteCurrentExam} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50" disabled={isLoadingExam || isSavingScores}>
                        <TrashIcon className="w-4 h-4"/> Hapus Tamrin Ini
                    </button>
                )}
                <button onClick={handleLoadOrCreateExam} className="flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50" disabled={isLoadingExam || isSavingScores}>
                {isLoadingExam ? 'Memuat...' : (currentExamId ? 'Muat Ulang Data' : 'Muat/Buat Tamrin')}
                </button>
            </div>
        )}
      </section>

      {/* Score Input Section */}
       {currentExamId && (
        <section className="pt-6 border-t border-base-300">
          <h3 className="text-lg font-semibold text-neutral-content mb-4">Input Nilai & Kehadiran - {namaTamrin} ({kelasRecords.find(k => k.id === selectedKelasId)?.namaKelas})</h3>
          {santriForCurrentExam.length === 0 ? (
            <p className="text-slate-500 text-center p-4 bg-base-200/30 rounded-md">Tidak ada santri aktif di kelas ini.</p>
          ) : (
            <div className="space-y-3">
              {santriForCurrentExam.map(santri => {
                const scoreData = currentScores.get(santri.id);
                return (
                  <div key={santri.id} className="p-3 border border-slate-300 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3 items-center bg-white shadow-sm">
                    <p className="md:col-span-2 text-sm font-medium">{santri.namalengkap} <span className="text-xs text-slate-500">({santri.nomorktt || '-'})</span></p>
                    <div className="md:col-span-1">
                      <select value={scoreData?.kehadiran || AttendanceStatus.HADIR} onChange={e => handleScoreChange(santri.id, 'kehadiran', e.target.value as AttendanceStatus)} className={`${inputClass} text-xs py-1`} disabled={!canManage}>
                        {daftarAttendanceStatus.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <input type="number" value={scoreData?.nilaiAngka === undefined ? '' : scoreData.nilaiAngka} onChange={e => handleScoreChange(santri.id, 'nilaiAngka', e.target.value)} className={`${inputClass} text-xs py-1`} placeholder="Nilai Angka" disabled={!canManage || scoreData?.kehadiran !== AttendanceStatus.HADIR}/>
                    </div>
                    <div className="md:col-span-1">
                      <input type="text" value={scoreData?.catatan || ''} onChange={e => handleScoreChange(santri.id, 'catatan', e.target.value)} className={`${inputClass} text-xs py-1`} placeholder="Catatan (opsional)" disabled={!canManage}/>
                    </div>
                  </div>
                );
              })}
              {canManage && (
                <div className="flex justify-end pt-3">
                    <button onClick={handleSaveAllScores} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50" disabled={isSavingScores}>
                    {isSavingScores ? (<><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Menyimpan...</>) : (<><CheckCircleIcon className="w-4 h-4"/> Simpan Semua</>)}
                    </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Rekapitulasi Section */}
      <section className="pt-6 border-t border-base-300">
        <h3 className="text-lg font-semibold text-neutral-content mb-4">Rekapitulasi Nilai Tamrin</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-base-200/30 rounded-lg shadow-sm">
          <div><label className={labelClass}>Filter Kelas:</label><select value={rekapKelasId} onChange={e => setRekapKelasId(e.target.value)} className={inputClass}><option value="">Semua Kelas</option>{kelasRecords.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
          <div><label className={labelClass}>Filter Asatidz:</label><select value={rekapAsatidzId} onChange={e => setRekapAsatidzId(e.target.value)} className={inputClass}><option value="">Semua Asatidz</option>{asatidzList.map(a => <option key={a.id} value={a.id}>{a.namaLengkap}</option>)}</select></div>
          <div><label className={labelClass}>Filter Nama Tamrin:</label><input type="text" value={rekapNamaTamrin} onChange={e => setRekapNamaTamrin(e.target.value)} className={inputClass} placeholder="Ketik nama tamrin..."/></div>
        </div>
        {filteredRekapScores.length === 0 ? (
          <p className="text-slate-500 text-center p-4 bg-base-200/30 rounded-md">Tidak ada data rekapitulasi Tamrin yang cocok.</p>
        ) : (
           <div className="overflow-x-auto rounded-lg shadow border border-base-300">
            <table className="min-w-full divide-y divide-base-300">
              <thead className="bg-base-200"><tr className="text-xs text-left text-neutral-content font-semibold">
                <th className="px-3 py-2">Santri</th><th className="px-3 py-2">Tamrin</th><th className="px-3 py-2">Kelas</th><th className="px-3 py-2">Asatidz</th><th className="px-3 py-2">Tgl</th><th className="px-3 py-2 text-center">Kehadiran</th><th className="px-3 py-2 text-center">Nilai</th><th className="px-3 py-2">Catatan</th>
              </tr></thead>
              <tbody className="divide-y divide-base-200 bg-base-100">
                {filteredRekapScores.map(sr => (
                  <tr key={sr.id} className="text-xs hover:bg-base-200/30">
                    <td className="px-3 py-2 font-medium">{sr.namaSantri} <span className="text-slate-500">({sr.nomorKTT})</span></td>
                    <td className="px-3 py-2">{sr.namaTamrin}</td><td className="px-3 py-2">{sr.namaKelas}</td>
                    <td className="px-3 py-2">{sr.namaAsatidz}</td>
                    <td className="px-3 py-2">{new Date(sr.tanggalPelaksanaan || 0).toLocaleDateString('id-ID')}</td>
                    <td className="px-3 py-2 text-center">{sr.kehadiran}</td>
                    <td className="px-3 py-2 text-center font-semibold">{sr.nilaiAngka ?? '-'}</td>
                    <td className="px-3 py-2 truncate max-w-xs" title={sr.catatan}>{sr.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManajemenUjianTamrinView;
