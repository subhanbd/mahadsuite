
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { BillDefinition, SupabaseDefaultFields } from '../types';

type BillDefinitionPayload = Omit<BillDefinition, SupabaseDefaultFields>;

interface BillDefinitionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BillDefinitionPayload, id?: string) => void;
  initialData?: BillDefinition | null;
}

const BillDefinitionFormModal: React.FC<BillDefinitionFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData 
}) => {
  const getInitialState = (): BillDefinitionPayload => ({
    namaTagihan: initialData?.namaTagihan || '',
    nominal: initialData?.nominal || 0,
    tanggalJatuhTempo: initialData?.tanggalJatuhTempo || 10, 
    periodeTahun: initialData?.periodeTahun || '', 
    tanggalMulaiPenagihan: initialData?.tanggalMulaiPenagihan || '',
    tanggalAkhirPenagihan: initialData?.tanggalAkhirPenagihan || '',
    deskripsi: initialData?.deskripsi || '',
  });

  const [formData, setFormData] = useState<BillDefinitionPayload>(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'nominal' || name === 'tanggalJatuhTempo' ? Number(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.namaTagihan.trim()) {
        alert("Nama Tagihan tidak boleh kosong.");
        return;
    }
    if (formData.nominal <= 0) {
        alert("Nominal harus lebih besar dari 0.");
        return;
    }
    if (formData.tanggalJatuhTempo < 1 || formData.tanggalJatuhTempo > 31) {
        alert("Tanggal Jatuh Tempo harus antara 1 dan 31.");
        return;
    }

    if (formData.tanggalMulaiPenagihan && formData.tanggalAkhirPenagihan) {
        if (new Date(formData.tanggalAkhirPenagihan) < new Date(formData.tanggalMulaiPenagihan)) {
            alert("Tanggal Akhir Penagihan tidak boleh sebelum Tanggal Mulai Penagihan.");
            return;
        }
    }
    
    onSubmit(formData, initialData?.id);
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90";

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={initialData ? 'Edit Jenis Tagihan' : 'Tambah Jenis Tagihan Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="namaTagihan" className={labelClass}>Nama Tagihan <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="namaTagihan"
            id="namaTagihan"
            value={formData.namaTagihan}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="nominal" className={labelClass}>Nominal Standar (Rp) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="nominal"
            id="nominal"
            value={formData.nominal}
            onChange={handleChange}
            className={inputClass}
            min="1"
            required
          />
        </div>
        <div>
          <label htmlFor="tanggalJatuhTempo" className={labelClass}>Tanggal Jatuh Tempo Setiap Bulan (1-31) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="tanggalJatuhTempo"
            id="tanggalJatuhTempo"
            value={formData.tanggalJatuhTempo}
            onChange={handleChange}
            className={inputClass}
            min="1"
            max="31"
            required
          />
           <p className="text-xs text-slate-500 mt-1">Contoh: Isi '10' untuk tanggal 10 setiap bulan.</p>
        </div>
        <div>
          <label htmlFor="periodeTahun" className={labelClass}>Label Periode (Opsional)</label>
          <input
            type="text"
            name="periodeTahun"
            id="periodeTahun"
            value={formData.periodeTahun || ''}
            onChange={handleChange}
            className={inputClass}
            placeholder="Cth: 2023, Semester Ganjil 23/24, atau Umum"
          />
           <p className="text-xs text-slate-500 mt-1">Label umum untuk tagihan ini. Kosongkan jika tidak spesifik.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
                <label htmlFor="tanggalMulaiPenagihan" className={labelClass}>Tanggal Mulai Penagihan (Opsional)</label>
                <input
                    type="date"
                    name="tanggalMulaiPenagihan"
                    id="tanggalMulaiPenagihan"
                    value={formData.tanggalMulaiPenagihan || ''}
                    onChange={handleChange}
                    className={inputClass}
                />
                <p className="text-xs text-slate-500 mt-1">Awal periode tagihan ini berlaku.</p>
            </div>
            <div>
                <label htmlFor="tanggalAkhirPenagihan" className={labelClass}>Tanggal Akhir Penagihan (Opsional)</label>
                <input
                    type="date"
                    name="tanggalAkhirPenagihan"
                    id="tanggalAkhirPenagihan"
                    value={formData.tanggalAkhirPenagihan || ''}
                    onChange={handleChange}
                    className={inputClass}
                />
                <p className="text-xs text-slate-500 mt-1">Akhir periode tagihan ini berlaku.</p>
            </div>
        </div>

        <div>
          <label htmlFor="deskripsi" className={labelClass}>Deskripsi (Opsional)</label>
          <textarea
            name="deskripsi"
            id="deskripsi"
            value={formData.deskripsi || ''}
            onChange={handleChange}
            rows={3}
            className={inputClass}
            placeholder="Deskripsi singkat mengenai tagihan ini..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-base-300 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md"
          >
            {initialData ? 'Simpan Perubahan' : 'Tambah Tagihan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BillDefinitionFormModal;
