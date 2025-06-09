
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { BlokRecord, Santri, SantriStatus, AppwriteDocument } from '../types';

type BlokPayload = Omit<BlokRecord, 'id' | keyof AppwriteDocument>;

interface BlokFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BlokPayload, id?: string) => void;
  initialData?: BlokRecord | null;
  activeSantriList: Santri[];
}

const BlokFormModal: React.FC<BlokFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData, 
    activeSantriList 
}) => {
  const getInitialState = (): BlokPayload => ({
    namaBlok: initialData?.namaBlok || '',
    ketuaBlokSantriId: initialData?.ketuaBlokSantriId || undefined, // Ensure undefined if not set
    jumlahKamar: initialData?.jumlahKamar === undefined ? undefined : Number(initialData.jumlahKamar),
    deskripsi: initialData?.deskripsi || '',
  });

  const [formData, setFormData] = useState<BlokPayload>(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | undefined = value;
    if (name === 'jumlahKamar') {
        processedValue = value === '' ? undefined : Number(value);
    } else if (name === 'ketuaBlokSantriId' && value === "") { 
        processedValue = undefined;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBlok.trim()) {
      alert("Nama Blok tidak boleh kosong.");
      return;
    }
    if (formData.jumlahKamar !== undefined && formData.jumlahKamar < 0) {
      alert("Jumlah kamar tidak boleh negatif.");
      return;
    }
    
    const dataToSubmit: BlokPayload = {
        namaBlok: formData.namaBlok,
        ketuaBlokSantriId: formData.ketuaBlokSantriId || undefined, 
        jumlahKamar: formData.jumlahKamar,
        deskripsi: formData.deskripsi,
    };

    onSubmit(dataToSubmit, initialData?.id);
  };

  const sortedSantriList = useMemo(() => 
    [...activeSantriList]
      .filter(s => s.status === SantriStatus.AKTIF)
      .sort((a, b) => a.namalengkap.localeCompare(b.namalengkap)),
    [activeSantriList]
  );

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Blok' : 'Tambah Blok Baru'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="namaBlok" className={labelClass}>Nama Blok <span className="text-red-500">*</span></label>
          <input type="text" name="namaBlok" id="namaBlok" value={formData.namaBlok} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="ketuaBlokSantriId" className={labelClass}>Ketua Blok (Opsional)</label>
          <select name="ketuaBlokSantriId" id="ketuaBlokSantriId" value={formData.ketuaBlokSantriId || ''} onChange={handleChange} className={inputClass}>
            <option value="">Pilih Ketua Blok (Jika Ada)</option>
            {sortedSantriList.map(santri => (
              <option key={santri.id} value={santri.id}>
                {santri.namalengkap} ({santri.nomorktt || 'No KTT'})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="jumlahKamar" className={labelClass}>Jumlah Kamar (Opsional)</label>
          <input type="number" name="jumlahKamar" id="jumlahKamar" value={formData.jumlahKamar === undefined ? '' : formData.jumlahKamar} onChange={handleChange} className={inputClass} placeholder="Angka, cth: 10" min="0"/>
        </div>
        <div>
          <label htmlFor="deskripsi" className={labelClass}>Deskripsi (Opsional)</label>
          <textarea name="deskripsi" id="deskripsi" value={formData.deskripsi} onChange={handleChange} rows={3} className={inputClass} placeholder="Deskripsi singkat mengenai blok ini..." />
        </div>
        <div className="flex justify-end gap-3 pt-5 border-t border-base-300 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md">
            Batal
          </button>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md">
            {initialData ? 'Simpan Perubahan' : 'Tambah Blok'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BlokFormModal;
