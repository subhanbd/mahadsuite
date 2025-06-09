
import React, { useState, useEffect } from 'react';
import { PesantrenProfileData } from '../types';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface PesantrenProfileViewProps {
  pesantrenProfile: PesantrenProfileData;
  onSavePesantrenProfile: (data: PesantrenProfileData) => void;
}

const PesantrenProfileView: React.FC<PesantrenProfileViewProps> = ({
  pesantrenProfile,
  onSavePesantrenProfile,
}) => {
  const [formData, setFormData] = useState<PesantrenProfileData>(pesantrenProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    setFormData(pesantrenProfile);
  }, [pesantrenProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccessMessage(false);
    
    // Simulate API call
    setTimeout(() => {
      onSavePesantrenProfile(formData);
      setIsSaving(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000); // Hide message after 3 seconds
    }, 700);
  };

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90 mb-1";

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 pb-4 border-b border-base-300">
        <BuildingLibraryIcon className="w-8 h-8 text-secondary" />
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">
            Profil Pesantren
            </h2>
            <p className="text-sm text-base-content/70">
            Atur nama, alamat, dan informasi kontak Pesantren Anda.
            </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="namaPesantren" className={labelClass}>Nama Pesantren <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="namaPesantren"
            name="namaPesantren"
            value={formData.namaPesantren}
            onChange={handleChange}
            className={inputClass}
            required
            placeholder="Contoh: Pesantren Modern Al-Hikmah"
          />
        </div>

        <div>
          <label htmlFor="alamatLengkap" className={labelClass}>Alamat Lengkap Pesantren <span className="text-red-500">*</span></label>
          <textarea
            id="alamatLengkap"
            name="alamatLengkap"
            value={formData.alamatLengkap}
            onChange={handleChange}
            rows={3}
            className={inputClass}
            required
            placeholder="Contoh: Jl. Pendidikan No. 123, Desa Santri Maju, Kec. Ilmu, Kab. Berkah, Provinsi Sejahtera, 12345"
          />
        </div>
        
        <div>
          <label htmlFor="kotaKabupaten" className={labelClass}>Kota/Kabupaten Pesantren</label>
          <input
            type="text"
            id="kotaKabupaten"
            name="kotaKabupaten"
            value={formData.kotaKabupaten || ''}
            onChange={handleChange}
            className={inputClass}
            placeholder="Contoh: Kota Santri, Kabupaten Berkah"
          />
           <p className="text-xs text-slate-500 mt-1">Nama kota/kabupaten ini akan digunakan pada kop surat atau footer dokumen.</p>
        </div>

        <div>
          <label htmlFor="nomorTelepon" className={labelClass}>Nomor Telepon Pesantren</label>
          <input
            type="tel"
            id="nomorTelepon"
            name="nomorTelepon"
            value={formData.nomorTelepon || ''}
            onChange={handleChange}
            className={inputClass}
            placeholder="Contoh: (021) 123-4567 atau 0812-3456-7890"
          />
        </div>
        
        <div className="pt-6 border-t border-base-300 flex flex-col sm:flex-row justify-end items-center gap-4">
          {showSuccessMessage && (
            <div className="flex items-center gap-2 text-sm text-success mr-auto">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Profil berhasil diperbarui!</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-neutral disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PesantrenProfileView;
