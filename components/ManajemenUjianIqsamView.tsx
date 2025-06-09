
import React, { useState, useMemo, useEffect } from 'react';
import { Santri, KelasRecord, IqsamExam, IqsamScoreRecord, IqsamPeriodeRefactored, AttendanceStatus, UserRole, daftarAttendanceStatus, AppwriteDocument } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

type IqsamExamPayload = Omit<IqsamExam, 'id' | keyof AppwriteDocument>;
type IqsamScorePayload = Omit<IqsamScoreRecord, keyof AppwriteDocument>;


interface ManajemenUjianIqsamViewProps {
  activeSantriList: Santri[];
  kelasRecords: KelasRecord[];
  iqsamExams: IqsamExam[];
  iqsamScoreRecords: IqsamScoreRecord[];
  onSaveExam: (exam: IqsamExamPayload, existingExamId?: string) => string; 
  onSaveScores: (scores: IqsamScorePayload[]) => void;
  onDeleteExamAndScores: (examId: string) => void;
  currentUserRole: UserRole;
}

const ManajemenUjianIqsamView: React.FC<ManajemenUjianIqsamViewProps> = ({
  activeSantriList,
  kelasRecords,
  iqsamExams,
  iqsamScoreRecords,
  onSaveExam,
  onSaveScores,
  onDeleteExamAndScores,
  currentUserRole,
}) => {
  const [selectedKelasId, setSelectedKelasId] = useState<string>(kelasRecords.length > 0 ? kelasRecords[0].id : '');
  const [selectedPeriode, setSelectedPeriode] = useState<IqsamPeriodeRefactored>(IqsamPeriodeRefactored.AWAL_TAHUN);
  const [tahunAjaran, setTahunAjaran] = useState<string>(`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
  const [mataPelajaran, setMataPelajaran] = useState<string>('');
  const [tanggalUjian, setTanggalUjian] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [currentScores, setCurrentScores] = useState<Map<string, Partial<Omit<IqsamScoreRecord, 'id' | 'lastUpdatedAt' | 'iqsamExamId'>>>>(new Map());
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const [isSavingScores, setIsSavingScores] = useState(false);

  // Rekapitulasi State
  const [rekapKelasId, setRekapKelasId] = useState<string>('');
  const [rekapPeriode, setRekapPeriode] = useState<IqsamPeriodeRefactored | ''>('');
  const [rekapTahunAjaran, setRekapTahunAjaran] = useState<string>('');
  const [rekapMataPelajaran, setRekapMataPelajaran] = useState<string>('');

  const canManage = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.ASATIDZ || currentUserRole === UserRole.SEKRETARIAT_SANTRI;

  useEffect(() => {
    setCurrentExamId(null);
    setCurrentScores(new Map());
  }, [selectedKelasId, selectedPeriode, tahunAjaran, mataPelajaran, tanggalUjian]);

  const handleLoadOrCreateExam = () => {
    if (!selectedKelasId || !tahunAjaran.trim() || !mataPelajaran.trim()) {
      alert("Mohon lengkapi Kelas, Tahun Ajaran, dan Mata Pelajaran.");
      return;
    }
    setIsLoadingExam(true);
    const existingExam = iqsamExams.find(ex => 
      ex.kelasId === selectedKelasId &&
      ex.periode === selectedPeriode &&
      ex.tahunAjaran === tahunAjaran &&
      ex.mataPelajaran.toLowerCase() === mataPelajaran.toLowerCase().trim() &&
      ex.tanggalUjian === tanggalUjian
    );

    if (existingExam) {
      setCurrentExamId(existingExam.id);
      loadScoresForExam(existingExam.id);
    } else {
      if (canManage) {
        const newExamData: IqsamExamPayload = { kelasId: selectedKelasId, periode: selectedPeriode, tahunAjaran, mataPelajaran: mataPelajaran.trim(), tanggalUjian };
        const newExamId = onSaveExam(newExamData);
        setCurrentExamId(newExamId);
        loadScoresForExam(newExamId); 
      } else {
        alert("Ujian tidak ditemukan. Hanya role tertentu yang bisa membuat ujian baru.");
      }
    }
    setIsLoadingExam(false);
  };
  
  const loadScoresForExam = (examId: string) => {
    const santriInClass = activeSantriList.filter(s => s.kelasid === selectedKelasId);
    const newScoresMap = new Map<string, Partial<Omit<IqsamScoreRecord, 'id' | 'lastUpdatedAt' | 'iqsamExamId'>>>();
    santriInClass.forEach(santri => {
      const existingScore = iqsamScoreRecords.find(sr => sr.iqsamExamId === examId && sr.santriId === santri.id);
      if (existingScore) {
        newScoresMap.set(santri.id, { ...existingScore });
      } else {
        newScoresMap.set(santri.id, { santriId: santri.id, kehadiran: AttendanceStatus.HADIR, nilaiAngka: undefined, catatan: undefined });
      }
    });
    setCurrentScores(newScoresMap);
  };
  
  const handleScoreChange = (santriId: string, field: keyof Omit<IqsamScoreRecord, 'id' | 'lastUpdatedAt' | 'iqsamExamId' | 'santriId'>, value: string | number | AttendanceStatus) => {
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
    const scoresToSave: IqsamScorePayload[] = [];
    currentScores.forEach((scoreData, santriId) => {
      scoresToSave.push({
        id: iqsamScoreRecords.find(sr => sr.iqsamExamId === currentExamId && sr.santriId === santriId)?.id || crypto.randomUUID(),
        iqsamExamId: currentExamId,
        santriId,
        kehadiran: scoreData.kehadiran || AttendanceStatus.HADIR,
        nilaiAngka: scoreData.nilaiAngka,
        catatan: scoreData.catatan,
        lastUpdatedAt: new Date().toISOString(),
      });
    });
    onSaveScores(scoresToSave);
    setTimeout(() => {
        setIsSavingScores(false);
        alert("Nilai dan kehadiran Iqsam berhasil disimpan!");
    }, 500);
  };
  
  const handleDeleteCurrentExam = () => {
    if (currentExamId && canManage) {
      if (confirm(`Apakah Anda yakin ingin menghapus ujian "${mataPelajaran}" periode "${selectedPeriode}" (${tahunAjaran}) untuk kelas ini beserta semua nilainya?`)) {
        onDeleteExamAndScores(currentExamId);
        setCurrentExamId(null);
        setCurrentScores(new Map());
        // Optionally reset mataPelajaran, etc., if desired after delete
        // setMataPelajaran(''); 
      }
    }
  };

  const santriForCurrentExam = useMemo(() => {
    if (!currentExamId || !selectedKelasId) return [];
    return activeSantriList.filter(s => s.kelasid === selectedKelasId)
                           .sort((a,b) => a.namalengkap.localeCompare(b.namalengkap));
  }, [currentExamId, selectedKelasId, activeSantriList]);

  const filteredRekapScores = useMemo(() => {
    return iqsamScoreRecords.filter(sr => {
      const exam = iqsamExams.find(ex => ex.id === sr.iqsamExamId);
      if (!exam) return false;
      if (rekapKelasId && exam.kelasId !== rekapKelasId) return false;
      if (rekapPeriode && exam.periode !== rekapPeriode) return false;
      if (rekapTahunAjaran && exam.tahunAjaran !== rekapTahunAjaran) return false;
      if (rekapMataPelajaran && !exam.mataPelajaran.toLowerCase().includes(rekapMataPelajaran.toLowerCase())) return false;
      return true;
    }).map(sr => {
      const exam = iqsamExams.find(ex => ex.id === sr.iqsamExamId);
      const santri = activeSantriList.find(s => s.id === sr.santriId);
      const kelas = kelasRecords.find(k => k.id === exam?.kelasId);
      return {
        ...sr,
        namaSantri: santri?.namalengkap || 'N/A',
        nomorKTT: santri?.nomorktt || '-',
        namaKelas: kelas?.namaKelas || 'N/A',
        periodeUjian: exam?.periode || 'N/A',
        tahunAjaranUjian: exam?.tahunAjaran || 'N/A',
        mataPelajaranUjian: exam?.mataPelajaran || 'N/A',
        tanggalUjianPelaksanaan: exam?.tanggalUjian,
      };
    }).sort((a,b) => (a.namaSantri.localeCompare(b.namaSantri)) || (new Date(b.tanggalUjianPelaksanaan || 0).getTime() - new Date(a.tanggalUjianPelaksanaan || 0).getTime()));
  }, [iqsamScoreRecords, iqsamExams, rekapKelasId, rekapPeriode, rekapTahunAjaran, rekapMataPelajaran, activeSantriList, kelasRecords]);


  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm";
  const labelClass = "block text-sm font-medium text-neutral-content/90 mb-1";
  
  const sortedKelasRecords = [...kelasRecords].sort((a,b) => (a.urutanTampilan ?? 99) - (b.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas));


  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-1">Ujian Iqsam</h2>
        <p className="text-sm text-base-content/70">Definisikan ujian, input nilai dan kehadiran santri, atau lihat rekapitulasi.</p>
      </div>

      {/* Exam Definition Section */}
      <section className="p-4 bg-base-200/50 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold text-neutral-content">Definisi Sesi Ujian Iqsam</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="selectedKelasId" className={labelClass}>Kelas <span className="text-red-500">*</span></label>
            <select id="selectedKelasId" value={selectedKelasId} onChange={e => setSelectedKelasId(e.target.value)} className={inputClass} disabled={!canManage && !!currentExamId}>
              {sortedKelasRecords.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="selectedPeriode" className={labelClass}>Periode <span className="text-red-500">*</span></label>
            <select id="selectedPeriode" value={selectedPeriode} onChange={e => setSelectedPeriode(e.target.value as IqsamPeriodeRefactored)} className={inputClass} disabled={!canManage && !!currentExamId}>
              {Object.values(IqsamPeriodeRefactored).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tahunAjaran" className={labelClass}>Th. Ajaran <span className="text-red-500">*</span></label>
            <input type="text" id="tahunAjaran" value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)} className={inputClass} placeholder="Cth: 2023/2024" disabled={!canManage && !!currentExamId}/>
          </div>
          <div>
            <label htmlFor="mataPelajaran" className={labelClass}>Mata Pelajaran <span className="text-red-500">*</span></label>
            <input type="text" id="mataPelajaran" value={mataPelajaran} onChange={e => setMataPelajaran(e.target.value)} className={inputClass} placeholder="Cth: Fiqih" disabled={!canManage && !!currentExamId}/>
          </div>
          <div>
            <label htmlFor="tanggalUjian" className={labelClass}>Tanggal Ujian <span className="text-red-500">*</span></label>
            <input type="date" id="tanggalUjian" value={tanggalUjian} onChange={e => setTanggalUjian(e.target.value)} className={inputClass} disabled={!canManage && !!currentExamId}/>
          </div>
        </div>
        {canManage && (
            <div className="flex justify-end gap-3 pt-3">
                {currentExamId && (
                    <button onClick={handleDeleteCurrentExam} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50" disabled={isLoadingExam || isSavingScores}>
                        <TrashIcon className="w-4 h-4"/> Hapus Ujian Ini
                    </button>
                )}
                <button onClick={handleLoadOrCreateExam} className="flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50" disabled={isLoadingExam || isSavingScores}>
                {isLoadingExam ? 'Memuat...' : (currentExamId ? 'Muat Ulang Data' : 'Muat/Buat Ujian')}
                </button>
            </div>
        )}
      </section>

      {/* Score Input Section */}
      {currentExamId && (
        <section className="pt-6 border-t border-base-300">
          <h3 className="text-lg font-semibold text-neutral-content mb-4">Input Nilai & Kehadiran - {mataPelajaran} ({selectedPeriode} {tahunAjaran})</h3>
          {santriForCurrentExam.length === 0 ? (
            <p className="text-slate-500 text-center p-4 bg-base-200/30 rounded-md">Tidak ada santri aktif di kelas ini.</p>
          ) : (
            <div className="space-y-3">
              {santriForCurrentExam.map(santri => {
                const scoreData = currentScores.get(santri.id);
                return (
                  <div key={santri.id} className="p-3 border border-slate-300 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-white shadow-sm">
                    <p className="md:col-span-1 text-sm font-medium">{santri.namalengkap} <span className="text-xs text-slate-500">({santri.nomorktt || '-'})</span></p>
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
        <h3 className="text-lg font-semibold text-neutral-content mb-4">Rekapitulasi Nilai Iqsam</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-3 bg-base-200/30 rounded-lg shadow-sm">
          <div><label className={labelClass}>Filter Kelas:</label><select value={rekapKelasId} onChange={e => setRekapKelasId(e.target.value)} className={inputClass}><option value="">Semua Kelas</option>{sortedKelasRecords.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}</select></div>
          <div><label className={labelClass}>Filter Periode:</label><select value={rekapPeriode} onChange={e => setRekapPeriode(e.target.value as IqsamPeriodeRefactored | '')} className={inputClass}><option value="">Semua Periode</option>{Object.values(IqsamPeriodeRefactored).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className={labelClass}>Filter Th. Ajaran:</label><input type="text" value={rekapTahunAjaran} onChange={e => setRekapTahunAjaran(e.target.value)} className={inputClass} placeholder="Cth: 2023/2024"/></div>
          <div><label className={labelClass}>Filter Mapel:</label><input type="text" value={rekapMataPelajaran} onChange={e => setRekapMataPelajaran(e.target.value)} className={inputClass} placeholder="Ketik nama mapel..."/></div>
        </div>
        {filteredRekapScores.length === 0 ? (
          <p className="text-slate-500 text-center p-4 bg-base-200/30 rounded-md">Tidak ada data rekapitulasi Iqsam yang cocok.</p>
        ) : (
           <div className="overflow-x-auto rounded-lg shadow border border-base-300">
            <table className="min-w-full divide-y divide-base-300">
              <thead className="bg-base-200"><tr className="text-xs text-left text-neutral-content font-semibold">
                <th className="px-3 py-2">Santri</th><th className="px-3 py-2">Mapel</th><th className="px-3 py-2">Kelas</th><th className="px-3 py-2">Periode</th><th className="px-3 py-2">Th. Ajaran</th><th className="px-3 py-2">Tgl Ujian</th><th className="px-3 py-2 text-center">Kehadiran</th><th className="px-3 py-2 text-center">Nilai</th><th className="px-3 py-2">Catatan</th>
              </tr></thead>
              <tbody className="divide-y divide-base-200 bg-base-100">
                {filteredRekapScores.map(sr => (
                  <tr key={sr.id} className="text-xs hover:bg-base-200/30">
                    <td className="px-3 py-2 font-medium">{sr.namaSantri} <span className="text-slate-500">({sr.nomorKTT})</span></td>
                    <td className="px-3 py-2">{sr.mataPelajaranUjian}</td><td className="px-3 py-2">{sr.namaKelas}</td>
                    <td className="px-3 py-2">{sr.periodeUjian}</td><td className="px-3 py-2">{sr.tahunAjaranUjian}</td>
                    <td className="px-3 py-2">{new Date(sr.tanggalUjianPelaksanaan || 0).toLocaleDateString('id-ID')}</td>
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

export default ManajemenUjianIqsamView;
