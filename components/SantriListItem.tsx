
import React from 'react'; 
import { Santri, SantriStatus, KelasRecord, BlokRecord } from '../types'; 
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import UserIcon from './icons/UserIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';

interface SantriListItemProps {
  santri: Santri;
  onEdit: (santri: Santri) => void;
  onDelete: (id: string) => void;
  onExportPdf: (santri: Santri) => void;
  kelasRecords: KelasRecord[]; 
  blokRecords: BlokRecord[];   
}

const SantriListItem: React.FC<SantriListItemProps> = ({ santri, onEdit, onDelete, onExportPdf, kelasRecords, blokRecords }) => {
  
  const fotoDisplay = santri.pasfotourl ? ( 
    <img src={santri.pasfotourl} alt={santri.namalengkap} className="w-24 h-24 object-cover rounded-full shadow-md" />
  ) : (
    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center shadow-md">
      <UserIcon className="w-16 h-16 text-slate-400" />
    </div>
  );
  
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateString; // return original if invalid
    }
  };

  const getStatusBadge = (status: SantriStatus): JSX.Element => {
    let badgeClass = "px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ";
    switch (status) {
      case SantriStatus.AKTIF:
        badgeClass += "bg-green-100 text-green-700";
        break;
      case SantriStatus.ALUMNI:
        badgeClass += "bg-blue-100 text-blue-700";
        break;
      default:
        badgeClass += "bg-slate-100 text-slate-700";
    }
    return <span className={badgeClass}>{status}</span>;
  };

  const displayAlamat = (): string => {
    const parts = [
      santri.alamatlengkap,
      santri.desakelurahan,
      santri.kecamatan,
      santri.kotakabupaten,
    ].filter(Boolean); // Filter out undefined or empty strings
    return parts.length > 0 ? parts.join(', ') : 'Alamat tidak lengkap';
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
