
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { KelasRecord, SupabaseDefaultFields } from '../types';

type KelasPayload = Omit<KelasRecord, SupabaseDefaultFields>;

interface KelasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KelasPayload, id?: string) => void;
  initialData?: KelasRecord | null;
}

const KelasFormModal: React.FC<KelasFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const getInitialState = (): KelasPayload => ({
    namaKelas: initialData?.namaKelas || '',
    urutanTampilan: initialData?.urutanTampilan === undefined ? undefined : Number(initialData.urutanTampilan),
    deskripsi: initialData?.deskripsi || '',
  });

  const [formData, setFormData] = useState<KelasPayload>(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKelas.trim()) {
      alert("Nama Kelas tidak boleh kosong.");
      return;
    }
    onSubmit(formData, initialData?.id);
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Kelas' : 'Tambah Kelas Baru'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="namaKelas" className={labelClass}>Nama Kelas <span className="text-red-500">*</span></label>
          <input type="text" name="namaKelas" id="namaKelas" value={formData.namaKelas} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="urutanTampilan" className={labelClass}>Urutan Tampilan (Opsional)</label>
          <input type="number" name="urutanTampilan" id="urutanTampilan" value={formData.urutanTampilan === undefined ? '' : formData.urutanTampilan} onChange={handleChange} className={inputClass} placeholder="Angka untuk mengurutkan (cth: 1, 2, 3)" min="0"/>
          <p className="text-xs text-slate-500 mt-1">Digunakan untuk mengurutkan kelas di dropdown. Kelas dengan urutan lebih kecil akan tampil lebih dulu.</p>
        </div>
        <div>
          <label htmlFor="deskripsi" className={labelClass}>Deskripsi (Opsional)</label>
          <textarea name="deskripsi" id="deskripsi" value={formData.deskripsi || ''} onChange={handleChange} rows={3} className={inputClass} placeholder="Deskripsi singkat mengenai kelas ini..." />
        </div>
        <div className="flex justify-end gap-3 pt-5 border-t border-base-300 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md">
            Batal
          </button>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md">
            {initialData ? 'Simpan Perubahan' : 'Tambah Kelas'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default KelasFormModal;
