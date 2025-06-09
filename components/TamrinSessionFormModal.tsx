
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { TamrinExam, KelasRecord, User, SupabaseDefaultFields } from '../types';

type TamrinExamPayload = Omit<TamrinExam, SupabaseDefaultFields>;

interface TamrinSessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TamrinExamPayload, id?: string) => void; 
  initialData?: TamrinExam | null; 
  kelasRecords: KelasRecord[];
  asatidzList: User[]; 
}

const TamrinSessionFormModal: React.FC<TamrinSessionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  kelasRecords,
  asatidzList,
}) => {
  const sortedKelas = [...kelasRecords].sort((a,b) => (a.urutanTampilan ?? 99) - (b.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas));
  const sortedAsatidz = [...asatidzList].sort((a,b) => a.namaLengkap.localeCompare(b.namaLengkap));

  const getInitialState = useCallback((): TamrinExamPayload => ({ 
    namaTamrin: initialData?.namaTamrin || '',
    kelasId: initialData?.kelasId || (sortedKelas.length > 0 ? sortedKelas[0].id : ''),
    asatidzId: initialData?.asatidzId || (sortedAsatidz.length > 0 ? sortedAsatidz[0].id : ''),
    tanggalPelaksanaan: initialData?.tanggalPelaksanaan || new Date().toISOString().split('T')[0],
    deskripsi: initialData?.deskripsi || '',
  }), [initialData, sortedKelas, sortedAsatidz]);

  const [formData, setFormData] = useState<TamrinExamPayload>(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [isOpen, getInitialState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaTamrin.trim() || !formData.kelasId || !formData.asatidzId) {
      alert("Nama Tamrin, Kelas, dan Asatidz Pelaksana tidak boleh kosong.");
      return;
    }
    onSubmit(formData, initialData?.id);
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90";
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Sesi Tamrin' : 'Tambah Sesi Tamrin Baru'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="namaTamrin" className={labelClass}>Nama Tamrin <span className="text-red-500">*</span></label>
          <input type="text" name="namaTamrin" id="namaTamrin" value={formData.namaTamrin} onChange={handleChange} className={inputClass} placeholder="Cth: Ulangan Harian Fiqh Bab 1" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kelasId" className={labelClass}>Kelas <span className="text-red-500">*</span></label>
            <select name="kelasId" id="kelasId" value={formData.kelasId} onChange={handleChange} className={inputClass} required>
              <option value="">Pilih Kelas</option>
              {sortedKelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="asatidzId" className={labelClass}>Asatidz Pelaksana <span className="text-red-500">*</span></label>
            <select name="asatidzId" id="asatidzId" value={formData.asatidzId} onChange={handleChange} className={inputClass} required>
              <option value="">Pilih Asatidz</option>
              {sortedAsatidz.map(a => <option key={a.id} value={a.id}>{a.namaLengkap}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="tanggalPelaksanaan" className={labelClass}>Tanggal Pelaksanaan <span className="text-red-500">*</span></label>
          <input type="date" name="tanggalPelaksanaan" id="tanggalPelaksanaan" value={formData.tanggalPelaksanaan} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="deskripsi" className={labelClass}>Deskripsi (Opsional)</label>
          <textarea name="deskripsi" id="deskripsi" value={formData.deskripsi || ''} onChange={handleChange} rows={3} className={inputClass} placeholder="Deskripsi singkat atau materi Tamrin..." />
        </div>
        <div className="flex justify-end gap-3 pt-5 border-t border-base-300 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md">Batal</button>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md">{initialData ? 'Simpan Perubahan' : 'Tambah Sesi'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default TamrinSessionFormModal;
