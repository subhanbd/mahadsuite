
import React, { useState, useMemo, useCallback } from 'react';
import { Santri, SantriStatus, CoretKttRecord, UserRole, userRoleDisplayNames, KelasRecord } from '../types'; // Added KelasRecord
import UserIcon from './icons/UserIcon';
import SearchIcon from './icons/SearchIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import PlusIcon from './icons/PlusIcon'; // Not used directly, but for consistency
import UserMinusIcon from './icons/UserMinusIcon';
import ConfirmationModal from './ConfirmationModal';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon'; // Added

interface CoretKttViewProps {
  activeSantriList: Santri[];
  coretKttRecords: CoretKttRecord[];
  onCoretKtt: (santriId: string, dismissalDate: string, reason: string) => void;
  currentUserRole: UserRole;
  onExportPdf: (record: CoretKttRecord) => void; 
  kelasRecords: KelasRecord[]; // Added prop
}

type ActiveTab = 'form' | 'rekap';
type SortKeyRekap = keyof CoretKttRecord | 'santriNamaLengkap' | 'santriKelasTerakhir' | 'actions';
type SortDirection = 'asc' | 'desc';

const calculateDateDifferenceString = (startDateStr: string, endDateStr: string): string => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
        return "Rentang tanggal tidak valid";
    }

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
        months--;
        const prevMonthEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
        days += prevMonthEndDate;
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    
    const parts = [];
    if (years > 0) parts.push(`${years} tahun`);
    if (months > 0) parts.push(`${months} bulan`);
    if (days > 0) parts.push(`${days} hari`);
    if (parts.length === 0 && years === 0 && months === 0 && days === 0) return "0 hari"; // Same day

    return parts.join(', ') || "Kurang dari sehari";
};

const CoretKttView: React.FC<CoretKttViewProps> = ({
  activeSantriList,
  coretKttRecords,
  onCoretKtt,
  currentUserRole,
  onExportPdf, 
  kelasRecords, // Destructure prop
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  
  // Form State
  const [selectedSantriIdForm, setSelectedSantriIdForm] = useState<string>('');
  const [santriSearchTermForm, setSantriSearchTermForm] = useState<string>('');
  const [dismissalDateForm, setDismissalDateForm] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reasonForm, setReasonForm] = useState<string>('');
  const [isSubmittingDismissal, setIsSubmittingDismissal] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [santriToDismiss, setSantriToDismiss] = useState<Santri | null>(null);

  // Rekapitulasi State
  const [rekapStartDate, setRekapStartDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1); 
    return d.toISOString().split('T')[0];
  });
  const [rekapEndDate, setRekapEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rekapSantriSearch, setRekapSantriSearch] = useState<string>('');
  const [rekapSortKey, setRekapSortKey] = useState<SortKeyRekap>('dismissalDate');
  const [rekapSortDirection, setRekapSortDirection] = useState<SortDirection>('desc');

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90 mb-1";
  const buttonClass = (variant: 'primary' | 'secondary' | 'danger' | 'info' = 'primary', size: 'sm' | 'md' = 'md') => 
    `flex items-center justify-center gap-2 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 disabled:opacity-50 disabled:cursor-not-allowed ${
      size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2.5 px-5 text-sm'
    } ${
      variant === 'primary' ? 'bg-secondary text-secondary-content hover:bg-secondary-focus focus:ring-secondary' :
      variant === 'secondary' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400' :
      variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500' :
      'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500' // 'info' variant
    }`;
  
  const filteredActiveSantriForSearchForm = useMemo(() => {
    if (!santriSearchTermForm.trim()) return [];
    const lowerSearch = santriSearchTermForm.toLowerCase();
    return activeSantriList
        .filter(s => 
            s.namalengkap.toLowerCase().includes(lowerSearch) || 
            s.nomorktt?.toLowerCase().includes(lowerSearch)
        )
        .slice(0, 5); 
  }, [santriSearchTermForm, activeSantriList]);

  const selectedSantriDetailsForm = useMemo(() => {
    const santri = activeSantriList.find(s => s.id === selectedSantriIdForm);
    if (!santri) return null;
    const namaKelas = kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas;
    return { ...santri, namaKelas: namaKelas || 'N/A' };
  }, [selectedSantriIdForm, activeSantriList, kelasRecords]);

  const handlePrepareDismissal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantriDetailsForm || !reasonForm.trim()) {
      alert("Mohon pilih santri dan isi alasan pencoretan.");
      return;
    }
    setSantriToDismiss(selectedSantriDetailsForm);
    setIsConfirmationModalOpen(true);
  };

  const confirmDismissal = () => {
    if (!santriToDismiss || !reasonForm.trim()) return;
    
    setIsSubmittingDismissal(true);
    onCoretKtt(santriToDismiss.id, dismissalDateForm, reasonForm);
    
    setTimeout(() => {
      setSelectedSantriIdForm('');
      setSantriSearchTermForm('');
      setDismissalDateForm(new Date().toISOString().split('T')[0]);
      setReasonForm('');
      setIsSubmittingDismissal(false);
      setIsConfirmationModalOpen(false);
      setSantriToDismiss(null);
    }, 500);
  };
  
  const filteredRekapData = useMemo(() => {
    return coretKttRecords
      .filter(record => {
        const dismissalD = new Date(record.dismissalDate);
        const startD = rekapStartDate ? new Date(rekapStartDate) : null;
        const endD = rekapEndDate ? new Date(rekapEndDate) : null;

        if (startD && dismissalD < startD) return false;
        if (endD) { const tempEnd = new Date(endD); tempEnd.setDate(tempEnd.getDate() + 1); if (dismissalD >= tempEnd) return false; } 

        if (rekapSantriSearch) {
          const lowerSearch = rekapSantriSearch.toLowerCase();
          if (!(record.santriNamaLengkap.toLowerCase().includes(lowerSearch) || record.santriNomorKTT?.toLowerCase().includes(lowerSearch))) {
            return false;
          }
        }
        return true;
      });
  }, [coretKttRecords, rekapStartDate, rekapEndDate, rekapSantriSearch]);

  const sortedRekapData = useMemo(() => {
    return [...filteredRekapData].sort((a, b) => {
      let valA, valB;
      if (rekapSortKey === 'actions') return 0;

      switch (rekapSortKey) {
        case 'santriNamaLengkap': valA = a.santriNamaLengkap; valB = b.santriNamaLengkap; break;
        case 'santriKelasTerakhir': valA = a.santriKelasTerakhir || ''; valB = b.santriKelasTerakhir || ''; break;
        case 'dismissalDate': 
            valA = new Date(a.dismissalDate).getTime(); 
            valB = new Date(b.dismissalDate).getTime(); 
            break;
        case 'tanggalMasukPesantren':
            valA = new Date(a.tanggalMasukPesantren).getTime();
            valB = new Date(b.tanggalMasukPesantren).getTime();
            break;
        default: 
            valA = a[rekapSortKey as keyof CoretKttRecord]?.toString().toLowerCase() || '';
            valB = b[rekapSortKey as keyof CoretKttRecord]?.toString().toLowerCase() || '';
            break;
      }
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return rekapSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return rekapSortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [filteredRekapData, rekapSortKey, rekapSortDirection]);

  const handleSortRekap = (key: SortKeyRekap) => {
    if (key === 'actions') return; 
    if (rekapSortKey === key) {
      setRekapSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setRekapSortKey(key);
      setRekapSortDirection('asc');
    }
  };

  const getSortIndicator = (key: SortKeyRekap) => {
    if (key === 'actions' || rekapSortKey !== key) return '↕';
    return rekapSortDirection === 'asc' ? '↑' : '↓';
  };
  
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return dateString; }
  };


  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">Coret Kartu Tanda Santri (KTT)</h2>
        <p className="text-sm text-base-content/70">Manajemen santri yang berhenti. Santri yang dicoret akan berstatus Alumni.</p>
      </div>

      <div className="flex border-b border-base-300">
        {(['form', 'rekap'] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-sm font-medium focus:outline-none transition-colors duration-150
              ${activeTab === tab 
                ? 'border-b-2 border-secondary text-secondary' 
                : 'text-base-content/70 hover:text-secondary'}`}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {tab === 'form' ? 'Formulir Coret KTT' : 'Rekapitulasi Santri Dicoret'}
          </button>
        ))}
      </div>

      {activeTab === 'form' && (
        <section className="mt-6 p-6 bg-base-200/50 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-neutral-content mb-4">Formulir Coret KTT Santri</h3>
          <form onSubmit={handlePrepareDismissal} className="space-y-4">
            <div>
              <label htmlFor="santriSearchTermForm" className={labelClass}>Cari Santri Aktif (Nama/KTT): <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  id="santriSearchTermForm"
                  value={santriSearchTermForm}
                  onChange={(e) => {
                      setSantriSearchTermForm(e.target.value);
                      if (selectedSantriIdForm && e.target.value === '') setSelectedSantriIdForm(''); 
                  }}
                  className={inputClass}
                  placeholder="Ketik Nama atau Nomor KTT Santri Aktif..."
                  required={!selectedSantriIdForm}
                />
                {santriSearchTermForm && filteredActiveSantriForSearchForm.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {filteredActiveSantriForSearchForm.map(s => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSantriIdForm(s.id);
                            setSantriSearchTermForm(`${s.namalengkap} (${s.nomorktt || 'No KTT'})`);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-neutral-content hover:bg-slate-100"
                        >
                          {s.namalengkap} ({s.nomorktt || 'No KTT'}) - Kelas: {kelasRecords.find(k => k.id === s.kelasid)?.namaKelas || 'N/A'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedSantriDetailsForm && (
                  <div className="mt-2 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200 shadow-sm">
                      <p>Santri terpilih: <strong>{selectedSantriDetailsForm.namalengkap}</strong></p>
                      <p>KTT: {selectedSantriDetailsForm.nomorktt || '-'}, Kelas Terakhir: {selectedSantriDetailsForm.namaKelas || '-'}</p>
                      <p>Tanggal Masuk: {formatDate(selectedSantriDetailsForm.tanggalmasuk)}, Tanggal Lahir: {formatDate(selectedSantriDetailsForm.tanggallahir)}</p>
                  </div>
              )}
            </div>
            <div>
              <label htmlFor="dismissalDateForm" className={labelClass}>Tanggal Pencoretan: <span className="text-red-500">*</span></label>
              <input type="date" id="dismissalDateForm" value={dismissalDateForm} onChange={e => setDismissalDateForm(e.target.value)} className={inputClass} required/>
            </div>
            <div>
              <label htmlFor="reasonForm" className={labelClass}>Alasan Pencoretan: <span className="text-red-500">*</span></label>
              <textarea id="reasonForm" value={reasonForm} onChange={e => setReasonForm(e.target.value)} rows={3} className={inputClass} placeholder="Jelaskan alasan pencoretan santri..." required></textarea>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className={buttonClass('danger')} disabled={isSubmittingDismissal || !selectedSantriIdForm || !reasonForm.trim()}>
                <UserMinusIcon className="w-5 h-5"/>
                {isSubmittingDismissal ? 'Memproses...' : 'Proses Coret KTT'}
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === 'rekap' && (
        <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="rekapStartDate" className={labelClass}>Dari Tanggal Dicoret:</label>
                    <input type="date" id="rekapStartDate" value={rekapStartDate} onChange={e => setRekapStartDate(e.target.value)} className={inputClass}/>
                </div>
                <div>
                    <label htmlFor="rekapEndDate" className={labelClass}>Sampai Tanggal Dicoret:</label>
                    <input type="date" id="rekapEndDate" value={rekapEndDate} onChange={e => setRekapEndDate(e.target.value)} className={inputClass}/>
                </div>
                <div className="md:col-span-1">
                     <label htmlFor="rekapSantriSearch" className={labelClass}>Cari Santri (Nama/KTT):</label>
                     <input type="text" id="rekapSantriSearch" value={rekapSantriSearch} onChange={e => setRekapSantriSearch(e.target.value)} className={inputClass} placeholder="Ketik nama atau KTT..."/>
                </div>
            </div>

            {sortedRekapData.length === 0 ? (
                <div className="p-10 bg-base-200/50 rounded-lg shadow text-center border-2 border-dashed border-base-300">
                    <InformationCircleIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-content">Tidak Ada Data Santri Dicoret</h3>
                    <p className="text-base-content/70">Belum ada data santri yang dicoret atau tidak ada yang cocok dengan filter yang dipilih.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow border border-base-300">
                    <table className="min-w-full divide-y divide-base-300">
                        <thead className="bg-base-200">
                            <tr>
                                {([
                                    { key: 'santriNamaLengkap', label: 'Nama Santri' },
                                    { key: 'santriNomorKTT', label: 'KTT' },
                                    { key: 'santriKelasTerakhir', label: 'Kelas Terakhir' },
                                    { key: 'tanggalMasukPesantren', label: 'Tgl Masuk' },
                                    { key: 'dismissalDate', label: 'Tgl Dicoret' },
                                    { key: 'reason', label: 'Alasan' },
                                    { key: 'ageAtDismissal', label: 'Usia Saat Dicoret' },
                                    { key: 'durationOfStay', label: 'Lama Tinggal' },
                                    { key: 'recordedBy', label: 'Dicatat Oleh' },
                                    { key: 'actions', label: 'Aksi'},
                                ] as {key: SortKeyRekap, label: string}[]).map(col => (
                                    <th key={col.key} scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-neutral-content cursor-pointer hover:bg-base-300" onClick={() => handleSortRekap(col.key)}>
                                        {col.label} {getSortIndicator(col.key)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-200 bg-base-100">
                            {sortedRekapData.map(record => (
                                <tr key={record.id} className="hover:bg-base-200/30 transition-colors duration-150">
                                    <td className="px-3 py-3 text-xs sm:text-sm font-medium text-neutral-content">{record.santriNamaLengkap}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{record.santriNomorKTT || '-'}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{record.santriKelasTerakhir || '-'}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{formatDate(record.tanggalMasukPesantren)}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{formatDate(record.dismissalDate)}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content max-w-xs truncate" title={record.reason}>{record.reason}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{record.ageAtDismissal}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{record.durationOfStay}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{record.recordedBy}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-center">
                                      <button
                                        onClick={() => onExportPdf(record)}
                                        className={buttonClass('info', 'sm')}
                                        aria-label={`Export PDF untuk ${record.santriNamaLengkap}`}
                                      >
                                        <DocumentArrowDownIcon className="w-3.5 h-3.5" /> PDF
                                      </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}
      
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmDismissal}
        title={`Konfirmasi Coret KTT: ${santriToDismiss?.namalengkap || ''}`}
        message={`Apakah Anda yakin ingin mencoret santri ${santriToDismiss?.namalengkap || 'ini'}? Status santri akan diubah menjadi Alumni. Tindakan ini tidak dapat diurungkan dari menu ini.`}
        confirmButtonText="Ya, Coret KTT"
        cancelButtonText="Batal"
      />
    </div>
  );
};

export default CoretKttView;
