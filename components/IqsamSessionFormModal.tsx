
import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { IqsamExam, IqsamPeriodeRefactored, IqsamSessionStatus, KelasRecord, SupabaseDefaultFields } from '../types'; 

type IqsamExamPayload = Omit<IqsamExam, SupabaseDefaultFields>;

interface IqsamSessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IqsamExamPayload, id?: string) => void; 
  initialData?: IqsamExam | null; 
  kelasRecords: KelasRecord[];
}

const IqsamSessionFormModal: React.FC<IqsamSessionFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  kelasRecords
}) => {
    
  const sortedKelas = [...kelasRecords].sort((a,b) => (a.urutanTampilan ?? 99) - (b.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas));

  const getInitialState = useCallback((): IqsamExamPayload => {
    const defaultKelasId = sortedKelas.length > 0 ? sortedKelas[0].id : '';
    const today = new Date().toISOString().split('T')[0];
    const defaultTahunAjaran = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

    return { 
        kelasId: initialData?.kelasId || defaultKelasId,
        tahunAjaran: initialData?.tahunAjaran || defaultTahunAjaran,
        periode: initialData?.periode || IqsamPeriodeRefactored.AWAL_TAHUN, 
        tanggalBukaPendaftaran: initialData?.tanggalBukaPendaftaran || today,
        tanggalTutupPendaftaran: initialData?.tanggalTutupPendaftaran || today,
        tanggalUjian: initialData?.tanggalUjian || today,
        mataPelajaran: initialData?.mataPelajaran || '', 
        jamMulaiUjian: initialData?.jamMulaiUjian || '',
        jamSelesaiUjian: initialData?.jamSelesaiUjian || '',
        status: initialData?.status || IqsamSessionStatus.PENDAFTARAN_DIBUKA,
        deskripsi: initialData?.deskripsi || '',
    };
  }, [initialData, sortedKelas]);

  const [formData, setFormData] = useState<IqsamExamPayload>(getInitialState());

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
    if (!formData.kelasId || !formData.tahunAjaran.trim() || !formData.mataPelajaran.trim()) {
        alert("Kelas, Tahun Ajaran, dan Mata Pelajaran tidak boleh kosong.");
        return;
    }
    if (formData.tanggalBukaPendaftaran && formData.tanggalTutupPendaftaran && formData.tanggalTutupPendaftaran < formData.tanggalBukaPendaftaran) {
        alert("Tanggal Tutup Pendaftaran tidak boleh sebelum Tanggal Buka Pendaftaran.");
        return;
    }
    if (formData.tanggalUjian && formData.tanggalTutupPendaftaran && formData.tanggalUjian < formData.tanggalTutupPendaftaran) {
        alert("Tanggal Ujian tidak boleh sebelum Tanggal Tutup Pendaftaran.");
        return;
    }
    if (formData.jamMulaiUjian && formData.jamSelesaiUjian && formData.jamSelesaiUjian <= formData.jamMulaiUjian) {
        alert("Jam Selesai Ujian harus setelah Jam Mulai Ujian.");
        return;
    }

    onSubmit(formData, initialData?.id);
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Sesi Iqsam' : 'Tambah Sesi Iqsam Baru'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
                <label htmlFor="kelasId" className={labelClass}>Kelas <span className="text-red-500">*</span></label>
                <select name="kelasId" id="kelasId" value={formData.kelasId} onChange={handleChange} className={inputClass} required>
                    <option value="">Pilih Kelas</option>
                    {sortedKelas.map(k => <option key={k.id} value={k.id}>{k.namaKelas}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="periode" className={labelClass}>Periode Iqsam <span className="text-red-500">*</span></label>
                <select name="periode" id="periode" value={formData.periode} onChange={handleChange} className={inputClass} required>
                    {Object.values(IqsamPeriodeRefactored).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="tahunAjaran" className={labelClass}>Tahun Ajaran <span className="text-red-500">*</span></label>
                <input type="text" name="tahunAjaran" id="tahunAjaran" value={formData.tahunAjaran} onChange={handleChange} className={inputClass} placeholder="Cth: 2023/2024" required />
            </div>
            <div>
                <label htmlFor="mataPelajaran" className={labelClass}>Mata Pelajaran <span className="text-red-500">*</span></label>
                <input type="text" name="mataPelajaran" id="mataPelajaran" value={formData.mataPelajaran} onChange={handleChange} className={inputClass} placeholder="Cth: Fiqih Bab Puasa" required />
            </div>
            <div>
                <label htmlFor="tanggalUjian" className={labelClass}>Tanggal Ujian Utama <span className="text-red-500">*</span></label>
                <input type="date" name="tanggalUjian" id="tanggalUjian" value={formData.tanggalUjian} onChange={handleChange} className={inputClass} required />
            </div>
             <div>
                <label htmlFor="status" className={labelClass}>Status Sesi <span className="text-red-500">*</span></label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className={inputClass} required>
                    {Object.values(IqsamSessionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-3 border-t border-base-300">
            <div>
                <label htmlFor="jamMulaiUjian" className={labelClass}>Jam Mulai Ujian (Opsional)</label>
                <input type="time" name="jamMulaiUjian" id="jamMulaiUjian" value={formData.jamMulaiUjian || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label htmlFor="jamSelesaiUjian" className={labelClass}>Jam Selesai Ujian (Opsional)</label>
                <input type="time" name="jamSelesaiUjian" id="jamSelesaiUjian" value={formData.jamSelesaiUjian || ''} onChange={handleChange} className={inputClass} />
            </div>
             <div>
                <label htmlFor="tanggalBukaPendaftaran" className={labelClass}>Tgl Buka Pendaftaran (Opsional)</label>
                <input type="date" name="tanggalBukaPendaftaran" id="tanggalBukaPendaftaran" value={formData.tanggalBukaPendaftaran || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label htmlFor="tanggalTutupPendaftaran" className={labelClass}>Tgl Tutup Pendaftaran (Opsional)</label>
                <input type="date" name="tanggalTutupPendaftaran" id="tanggalTutupPendaftaran" value={formData.tanggalTutupPendaftaran || ''} onChange={handleChange} className={inputClass} />
            </div>
        </div>
       
        <div>
          <label htmlFor="deskripsi" className={labelClass}>Deskripsi/Catatan Sesi (Opsional)</label>
          <textarea name="deskripsi" id="deskripsi" value={formData.deskripsi || ''} onChange={handleChange} rows={2} className={inputClass} placeholder="Informasi tambahan mengenai sesi Iqsam ini..." />
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-base-300 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-base-100 focus:ring-slate-400 transition-colors shadow hover:shadow-md">Batal</button>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-base-100 focus:ring-secondary transition-colors shadow hover:shadow-md">{initialData ? 'Simpan Perubahan' : 'Tambah Sesi Iqsam'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default IqsamSessionFormModal;
