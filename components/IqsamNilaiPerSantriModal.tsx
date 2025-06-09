
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { IqsamResult, IqsamSubjectScore, AttendanceStatus, SupabaseDefaultFields } from '../types'; 
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

type IqsamResultPayload = Omit<IqsamResult, SupabaseDefaultFields | 'lastUpdated'>;

interface IqsamNilaiSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  iqsamRegistrationId: string;
  santriId: string;
  santriName: string;
  iqsamSessionId: string;
  existingResult?: IqsamResult | null; 
  onSaveIqsamResult: (resultData: IqsamResultPayload) => void;
}

const IqsamNilaiSantriModal: React.FC<IqsamNilaiSantriModalProps> = ({
  isOpen,
  onClose,
  iqsamRegistrationId,
  santriId,
  santriName,
  iqsamSessionId,
  existingResult,
  onSaveIqsamResult,
}) => {
  const [subjectScores, setSubjectScores] = useState<IqsamSubjectScore[]>([]);
  const [newSubject, setNewSubject] = useState<string>('');
  const [newScoreNumber, setNewScoreNumber] = useState<string>(''); 
  const [newSubjectNotes, setNewSubjectNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSubjectScores(existingResult?.scores?.map(s => ({
        mataPelajaran: s.mataPelajaran,
        nilaiAngka: s.nilaiAngka,
        catatan: s.catatan
      })) || []);
      setNewSubject('');
      setNewScoreNumber('');
      setNewSubjectNotes('');
    }
  }, [isOpen, existingResult]);

  const handleAddSubjectScore = () => {
    if (!newSubject.trim()) {
      alert("Nama Mata Pelajaran tidak boleh kosong.");
      return;
    }
    const newScore: IqsamSubjectScore = {
      mataPelajaran: newSubject.trim(),
      nilaiAngka: newScoreNumber !== '' ? parseFloat(newScoreNumber) : undefined,
      catatan: newSubjectNotes.trim() || undefined,
    };
    setSubjectScores(prev => [...prev, newScore]);
    setNewSubject('');
    setNewScoreNumber('');
    setNewSubjectNotes('');
  };

  const handleRemoveSubjectScore = (index: number) => {
    setSubjectScores(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubjectScoreChange = (index: number, field: keyof IqsamSubjectScore, value: string | number) => {
    setSubjectScores(prev => {
      const updated = [...prev];
      const scoreToUpdate = { ...updated[index] };
      if (field === 'nilaiAngka') {
        scoreToUpdate[field] = value === '' ? undefined : Number(value);
      } else if (field === 'mataPelajaran' || field === 'catatan') {
        scoreToUpdate[field] = field === 'mataPelajaran' ? String(value) : (String(value).trim() || undefined);
      }
      updated[index] = scoreToUpdate;
      return updated;
    });
  };

  const handleSubmitAllScores = () => {
    const resultData: IqsamResultPayload = {
      iqsamRegistrationId,
      santriId,
      iqsamSessionId,
      kehadiranKeseluruhan: existingResult?.kehadiranKeseluruhan || AttendanceStatus.HADIR,
      catatanKehadiran: existingResult?.catatanKehadiran,
      scores: subjectScores,
    };
    onSaveIqsamResult(resultData);
    onClose();
  };
  
  const inputClass = "mt-1 block w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary sm:text-sm text-neutral-content";
  const labelClass = "block text-xs font-medium text-neutral-content/90";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Input Nilai Iqsam untuk ${santriName}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {subjectScores.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-content">Daftar Nilai Tersimpan:</h4>
            {subjectScores.map((score, index) => (
              <div key={index} className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-secondary">{score.mataPelajaran}</p>
                  <button onClick={() => handleRemoveSubjectScore(index)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label htmlFor={`scoreNum-${index}`} className={labelClass}>Nilai Angka:</label>
                    <input type="number" id={`scoreNum-${index}`} value={score.nilaiAngka === undefined ? '' : score.nilaiAngka} onChange={(e) => handleSubjectScoreChange(index, 'nilaiAngka', e.target.value)} className={inputClass} step="0.1" placeholder="Cth: 85.5"/>
                  </div>
                </div>
                <div>
                  <label htmlFor={`notes-${index}`} className={labelClass}>Catatan Mapel:</label>
                  <textarea id={`notes-${index}`} value={score.catatan || ''} onChange={(e) => handleSubjectScoreChange(index, 'catatan', e.target.value)} rows={1} className={inputClass} placeholder="Catatan untuk mapel ini..."/>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-neutral-content mb-2">Tambah Nilai Mata Pelajaran Baru:</h4>
          <div className="space-y-2 p-3 border border-slate-300 rounded-lg bg-white">
            <div>
              <label htmlFor="newSubject" className={labelClass}>Mata Pelajaran <span className="text-red-500">*</span></label>
              <input type="text" id="newSubject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className={inputClass} placeholder="Nama Mata Pelajaran" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label htmlFor="newScoreNumber" className={labelClass}>Nilai Angka</label>
                <input type="number" id="newScoreNumber" value={newScoreNumber} onChange={(e) => setNewScoreNumber(e.target.value)} className={inputClass} step="0.1" placeholder="Cth: 90"/>
              </div>
            </div>
             <div>
                <label htmlFor="newSubjectNotes" className={labelClass}>Catatan Mata Pelajaran</label>
                <textarea id="newSubjectNotes" value={newSubjectNotes} onChange={(e) => setNewSubjectNotes(e.target.value)} rows={1} className={inputClass} placeholder="Catatan untuk mapel baru..."/>
            </div>
            <button onClick={handleAddSubjectScore} className="mt-2 flex items-center gap-1 text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm">
              <PlusIcon className="w-4 h-4" /> Tambah Mapel Ini
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-base-300 mt-6">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md">Batal</button>
        <button type="button" onClick={handleSubmitAllScores} className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md">Simpan Semua Nilai</button>
      </div>
    </Modal>
  );
};

export default IqsamNilaiSantriModal;
