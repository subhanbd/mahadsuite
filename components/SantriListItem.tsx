
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Santri, SantriStatus, KelasRecord, BlokRecord } from '../types'; 
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import UserIcon from './icons/UserIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';
import { storage as appwriteStorage, APPWRITE_BUCKET_ID_SANTRI_PHOTOS } from '../services/appwriteClient'; // Import Appwrite storage

interface SantriListItemProps {
  santri: Santri;
  onEdit: (santri: Santri) => void;
  onDelete: (id: string) => void;
  onExportPdf: (santri: Santri) => void;
  kelasRecords: KelasRecord[]; 
  blokRecords: BlokRecord[];   
}

const SantriListItem: React.FC<SantriListItemProps> = ({ santri, onEdit, onDelete, onExportPdf, kelasRecords, blokRecords }) => {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (santri.pasFotoFileId) {
      try {
        const url = appwriteStorage.getFilePreview(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, santri.pasFotoFileId);
        setFotoUrl(url);
      } catch (error) {
        console.error("Error generating file preview URL for santri:", santri.namalengkap, error);
        setFotoUrl(null);
      }
    } else {
      setFotoUrl(null);
    }
  }, [santri.pasFotoFileId, santri.namalengkap]);

  const fotoDisplay = fotoUrl ? ( 
    <img src={fotoUrl} alt={santri.namalengkap} className="w-24 h-24 object-cover rounded-full shadow-md" />
  ) : (
    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center shadow-md">
      <UserIcon className="w-16 h-16 text-slate-400" />
    </div>
  );
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            if (parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) {
                 return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric'
                });
            }
        }
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    } catch (e) {
        return dateString; 
    }
  };

  const getStatusBadge = (status: SantriStatus) => {
    const statusString = status as string; 
    switch (statusString) {
      case SantriStatus.AKTIF:
        return <span className="px-2.5 py-1 text-xs font-semibold text-success-content bg-success rounded-full shadow-sm">Aktif</span>;
      case 'Pulang': 
        return <span className="px-2.5 py-1 text-xs font-semibold text-warning-content bg-warning rounded-full shadow-sm">Pulang</span>;
      case SantriStatus.ALUMNI:
        return <span className="px-2.5 py-1 text-xs font-semibold text-info-content bg-info rounded-full shadow-sm">Alumni</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold text-neutral-content bg-neutral-focus rounded-full shadow-sm">{statusString}</span>;
    }
  };
  
  const displayAlamat = () => {
    const parts = [
      santri.dusun,
      santri.desakelurahan, 
      santri.kecamatan,
      santri.kotakabupaten, 
      santri.provinsi
    ].filter(Boolean).join(', ');
    return parts || santri.alamatlengkap || 'Tidak ada data alamat.'; 
  };

  const namaKelas = kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas || 'N/A'; 
  const namaBlok = blokRecords.find(b => b.id === santri.blokid)?.namaBlok || 'N/A';   

  return (
    <div className="bg-base-100 shadow-xl rounded-xl overflow-hidden transform hover:scale-[1.01] hover:shadow-2xl transition-all duration-300 ease-in-out">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="flex-shrink-0">
          {fotoDisplay}
        </div>
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-xl md:text-2xl font-bold text-secondary">{santri.namalengkap}</h3> 
            {getStatusBadge(santri.status)}
          </div>
          <p className="text-sm text-slate-500 font-medium mb-3">({santri.namapanggilan || 'Nama Panggilan Tidak Ada'})</p> 
          
          <div className="space-y-1 text-sm text-base-content/90">
            {santri.nomorindukkependudukan && <p><strong className="font-semibold text-neutral-content">NIK:</strong> {santri.nomorindukkependudukan}</p>}
            {santri.nomorkartukeluarga && <p><strong className="font-semibold text-neutral-content">No. KK:</strong> {santri.nomorkartukeluarga}</p>}
            {santri.nomorktt && <p><strong className="font-semibold text-neutral-content">No. KTT:</strong> {santri.nomorktt}</p>}
            <p><strong className="font-semibold text-neutral-content">TTL:</strong> {santri.tempatlahir}, {formatDate(santri.tanggallahir)}</p> 
            <p><strong className="font-semibold text-neutral-content">Alamat:</strong> {displayAlamat()}</p>
            {santri.provinsi && <p><strong className="font-semibold text-neutral-content">Provinsi:</strong> {santri.provinsi}</p>}
            {!santri.provinsi && santri.daerahasal && <p><strong className="font-semibold text-neutral-content">Daerah Asal (Umum):</strong> {santri.daerahasal}</p>}
            <p><strong className="font-semibold text-neutral-content">Wali:</strong> {santri.namawali} ({santri.nomorteleponwali || 'No. HP tidak ada'})</p> 
            <p><strong className="font-semibold text-neutral-content">Tanggal Masuk:</strong> {formatDate(santri.tanggalmasuk)}</p> 
            <p><strong className="font-semibold text-neutral-content">Kelas/Halaqah:</strong> {namaKelas}</p>
            <p><strong className="font-semibold text-neutral-content">Blok:</strong> {namaBlok}</p>
            {santri.nomorkamar && <p><strong className="font-semibold text-neutral-content">No. Kamar:</strong> {santri.nomorkamar}</p>}
            {santri.catatan && <p className="text-xs text-slate-500 mt-2 italic"><strong className="font-medium text-slate-600">Catatan:</strong> {santri.catatan}</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 mt-4 sm:mt-0 self-start sm:self-auto pt-1">
          <button
            onClick={() => onEdit(santri)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-secondary-content bg-secondary rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-secondary transition-all duration-150 ease-in-out shadow hover:shadow-md"
            aria-label={`Edit ${santri.namalengkap}`}
          >
            <PencilIcon className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => onExportPdf(santri)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-blue-500 transition-all duration-150 ease-in-out shadow hover:shadow-md"
            aria-label={`Export PDF ${santri.namalengkap}`}
          >
            <DocumentArrowDownIcon className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={() => onDelete(santri.id)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-error-content bg-error rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-error transition-all duration-150 ease-in-out shadow hover:shadow-md"
            aria-label={`Delete ${santri.namalengkap}`}
          >
            <TrashIcon className="w-4 h-4" /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default SantriListItem;
