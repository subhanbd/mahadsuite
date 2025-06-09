
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Santri, LeavePermitRecord, LeaveType, LeavePermitStatus, UserRole, daftarLeaveType, daftarLeavePermitStatus, userRoleDisplayNames, SantriStatus, KelasRecord, SupabaseDefaultFields } from '../types'; 
import UserIcon from './icons/UserIcon';
import SearchIcon from './icons/SearchIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import PlusIcon from './icons/PlusIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon'; 

type LeavePermitPayload = Omit<LeavePermitRecord, keyof SupabaseDefaultFields | 'recordedAt' | 'durationMinutes' | 'actualReturnDate' | 'actualReturnTime'>;


interface PerizinanSantriViewProps {
  activeSantriList: Santri[];
  leavePermitRecords: LeavePermitRecord[];
  onAddLeavePermit: (permit: LeavePermitPayload) => void;
  onMarkSantriAsReturned: (permitId: string, actualReturnDate: string, actualReturnTime?: string | null) => void;
  currentUserRole: UserRole;
  kelasRecords: KelasRecord[]; 
}

type ActiveTab = 'form' | 'rekap';
type SortKeyRekap = keyof LeavePermitRecord | 'santriName' | 'santriKelas';
type SortDirection = 'asc' | 'desc';

const formatDurationFromMinutes = (totalMinutes: number | null | undefined): string => {
    if (totalMinutes === null || totalMinutes === undefined || totalMinutes < 0) return '-';
    if (totalMinutes === 0) return '0 menit';

    const days = Math.floor(totalMinutes / (24 * 60));
    const remainingMinutesAfterDays = totalMinutes % (24 * 60);
    const hours = Math.floor(remainingMinutesAfterDays / 60);
    const minutes = remainingMinutesAfterDays % 60;

    let parts = [];
    if (days > 0) parts.push(`${days} hari`);
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    
    return parts.length > 0 ? parts.join(' ') : 'Kurang dari 1 menit';
};


const PerizinanSantriView: React.FC<PerizinanSantriViewProps> = ({
  activeSantriList,
  leavePermitRecords,
  onAddLeavePermit,
  onMarkSantriAsReturned,
  currentUserRole,
  kelasRecords, 
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  
  // Form State
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [santriSearchTerm, setSantriSearchTerm] = useState<string>('');
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.PULANG_KE_RUMAH);
  const [reason, setReason] = useState<string>('');
  const [leaveDate, setLeaveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveTime, setLeaveTime] = useState<string>(''); // HH:mm
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [expectedReturnTime, setExpectedReturnTime] = useState<string>(''); // HH:mm
  const [isSubmittingPermit, setIsSubmittingPermit] = useState<boolean>(false);

  // Mark Return State
  const [permitToMarkReturn, setPermitToMarkReturn] = useState<LeavePermitRecord | null>(null);
  const [actualReturnDateInput, setActualReturnDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actualReturnTimeInput, setActualReturnTimeInput] = useState<string>(''); // HH:mm
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);

  // Rekapitulasi State
  const [rekapStartDate, setRekapStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); 
    return d.toISOString().split('T')[0];
  });
  const [rekapEndDate, setRekapEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rekapSantriSearch, setRekapSantriSearch] = useState<string>('');
  const [rekapLeaveTypeFilter, setRekapLeaveTypeFilter] = useState<LeaveType | ''>('');
  const [rekapStatusFilter, setRekapStatusFilter] = useState<LeavePermitStatus | ''>('');
  const [rekapSortKey, setRekapSortKey] = useState<SortKeyRekap>('leaveDate');
  const [rekapSortDirection, setRekapSortDirection] = useState<SortDirection>('desc');

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90 mb-1";
  const buttonClass = (variant: 'primary' | 'secondary' | 'danger' = 'primary', size: 'sm' | 'md' = 'md') => 
    `flex items-center justify-center gap-2 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 disabled:opacity-50 disabled:cursor-not-allowed ${
      size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2.5 px-5 text-sm'
    } ${
      variant === 'primary' ? 'bg-secondary text-secondary-content hover:bg-secondary-focus focus:ring-secondary' :
      variant === 'secondary' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400' :
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
    }`;
  
  const filteredActiveSantriForSearch = useMemo(() => {
    if (!santriSearchTerm.trim()) return [];
    const lowerSearch = santriSearchTerm.toLowerCase();
    return activeSantriList
        .filter(s => s.status === SantriStatus.AKTIF) 
        .filter(s => 
            s.namalengkap.toLowerCase().includes(lowerSearch) || 
            s.nomorktt?.toLowerCase().includes(lowerSearch)
        )
        .slice(0, 5); 
  }, [santriSearchTerm, activeSantriList]);

  const selectedSantriDetails = useMemo(() => {
    const santri = activeSantriList.find(s => s.id === selectedSantriId);
    if (!santri) return null;
    const namaKelas = kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas;
    return { ...santri, namaKelas: namaKelas || 'N/A' };
  }, [selectedSantriId, activeSantriList, kelasRecords]);

  // Effect to manage expectedReturnDate and time fields based on leaveType
  useEffect(() => {
    if (leaveType === LeaveType.IZIN_KELUAR_SEMENTARA) {
      setExpectedReturnDate(leaveDate); 
    } else {
      setLeaveTime('');
      setExpectedReturnTime('');
    }
  }, [leaveType, leaveDate]);


  const handleSubmitPermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantriId) {
      alert("Pilih santri terlebih dahulu.");
      return;
    }

    let finalExpectedReturnDate = expectedReturnDate;
    if (leaveType === LeaveType.IZIN_KELUAR_SEMENTARA) {
        finalExpectedReturnDate = leaveDate; 
        if (!leaveTime || !expectedReturnTime) {
            alert("Waktu keluar dan estimasi waktu kembali harus diisi untuk izin keluar sementara.");
            return;
        }
         if (leaveTime >= expectedReturnTime) { 
            alert("Estimasi waktu kembali harus setelah waktu keluar pada hari yang sama.");
            return;
        }
    } else { 
        if (new Date(finalExpectedReturnDate) < new Date(leaveDate)) {
          alert("Tanggal estimasi kembali tidak boleh sebelum tanggal izin.");
          return;
        }
        if ((leaveType === LeaveType.PULANG_KE_RUMAH || leaveType === LeaveType.IZIN_KEPERLUAN_PESANTREN) && !reason.trim()) {
            alert("Alasan harus diisi untuk jenis izin ini.");
            return;
        }
    }
    

    setIsSubmittingPermit(true);
    const permitData: LeavePermitPayload = {
      santriId: selectedSantriId,
      leaveType,
      reason: (leaveType === LeaveType.PULANG_KE_RUMAH || leaveType === LeaveType.IZIN_KEPERLUAN_PESANTREN) ? reason : 
              (leaveType === LeaveType.IZIN_KELUAR_SEMENTARA && reason.trim()) ? reason : undefined,
      leaveDate,
      expectedReturnDate: finalExpectedReturnDate,
      status: LeavePermitStatus.IZIN,
      recordedBy: userRoleDisplayNames[currentUserRole],
      leaveTime: leaveType === LeaveType.IZIN_KELUAR_SEMENTARA ? (leaveTime || null) : null,
      expectedReturnTime: leaveType === LeaveType.IZIN_KELUAR_SEMENTARA ? (expectedReturnTime || null) : null,
    };

    onAddLeavePermit(permitData);

    setTimeout(() => {
      setSelectedSantriId('');
      setSantriSearchTerm('');
      setLeaveType(LeaveType.PULANG_KE_RUMAH); 
      setReason('');
      setLeaveDate(new Date().toISOString().split('T')[0]);
      setLeaveTime('');
      setExpectedReturnDate(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      });
      setExpectedReturnTime('');
      setIsSubmittingPermit(false);
      alert('Izin berhasil ditambahkan!');
    }, 500);
  };

  const santriOnLeave = useMemo(() => {
    return leavePermitRecords
        .filter(p => p.status === LeavePermitStatus.IZIN)
        .map(p => {
            const santri = activeSantriList.find(s => s.id === p.santriId);
            const namaKelas = santri ? kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas : 'N/A';
            return { ...p, santriName: santri?.namalengkap || 'Nama Tidak Ditemukan', santriKTT: santri?.nomorktt, santriKelas: namaKelas };
        })
        .sort((a,b) => new Date(b.leaveDate + 'T' + (b.leaveTime || '00:00')).getTime() - new Date(a.leaveDate + 'T' + (a.leaveTime || '00:00')).getTime());
  }, [leavePermitRecords, activeSantriList, kelasRecords]);

  const handleOpenMarkReturn = (permit: LeavePermitRecord) => {
    setPermitToMarkReturn(permit);
    setActualReturnDateInput(new Date().toISOString().split('T')[0]);
    setActualReturnTimeInput(permit.leaveType === LeaveType.IZIN_KELUAR_SEMENTARA ? new Date().toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'}) : '');
  };

  const handleCancelMarkReturn = () => {
    setPermitToMarkReturn(null);
  };

  const handleSubmitReturn = () => {
    if (!permitToMarkReturn || !actualReturnDateInput) return;
    
    const permit = permitToMarkReturn; 
    const combinedLeaveDateTime = new Date(`${permit.leaveDate}T${permit.leaveTime || '00:00'}`);
    const combinedActualReturnDateTime = new Date(`${actualReturnDateInput}T${actualReturnTimeInput || '00:00'}`);

    if (permit.leaveType === LeaveType.IZIN_KELUAR_SEMENTARA && !actualReturnTimeInput) {
        alert("Waktu kembali aktual harus diisi untuk izin keluar sementara.");
        return;
    }

    if (combinedActualReturnDateTime < combinedLeaveDateTime) {
        alert("Tanggal dan waktu kembali tidak boleh sebelum tanggal dan waktu izin.");
        return;
    }
    
    setIsSubmittingReturn(true);
    onMarkSantriAsReturned(permit.id, actualReturnDateInput, actualReturnTimeInput || null);
    
    setTimeout(() => {
      setIsSubmittingReturn(false);
      setPermitToMarkReturn(null);
      alert('Santri berhasil ditandai sudah kembali.');
    }, 500);
  };
  
  const formatDateWithTime = (dateString?: string | null, timeString?: string | null) => {
    if (!dateString) return '-';
    try {
      const datePart = new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      if (timeString) {
        return `${datePart}, ${timeString}`;
      }
      return datePart;
    } catch (e) {
      return dateString;
    }
  };

  const filteredRekapData = useMemo(() => {
    return leavePermitRecords
      .map(p => {
        const santri = activeSantriList.find(s => s.id === p.santriId);
        const namaKelas = santri ? kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas : 'N/A';
        return { ...p, santriName: santri?.namalengkap || 'Nama Tidak Ditemukan', santriKelas: namaKelas, santriKTT: santri?.nomorktt };
      })
      .filter(p => {
        const leaveD = new Date(p.leaveDate);
        const startD = rekapStartDate ? new Date(rekapStartDate) : null;
        const endD = rekapEndDate ? new Date(rekapEndDate) : null;
        if (startD && leaveD < startD) return false;
        if (endD) { const tempEnd = new Date(endD); tempEnd.setDate(tempEnd.getDate() + 1); if (leaveD >= tempEnd) return false; } 

        if (rekapLeaveTypeFilter && p.leaveType !== rekapLeaveTypeFilter) return false;
        if (rekapStatusFilter && p.status !== rekapStatusFilter) return false;
        if (rekapSantriSearch) {
          const lowerSearch = rekapSantriSearch.toLowerCase();
          if (!(p.santriName.toLowerCase().includes(lowerSearch) || p.santriKTT?.toLowerCase().includes(lowerSearch))) {
            return false;
          }
        }
        return true;
      });
  }, [leavePermitRecords, activeSantriList, kelasRecords, rekapStartDate, rekapEndDate, rekapLeaveTypeFilter, rekapStatusFilter, rekapSantriSearch]);

  const sortedRekapData = useMemo(() => {
    return [...filteredRekapData].sort((a, b) => {
      let valA, valB;
      switch (rekapSortKey) {
        case 'santriName': valA = a.santriName; valB = b.santriName; break;
        case 'santriKelas': valA = a.santriKelas || ''; valB = b.santriKelas || ''; break;
        case 'leaveDate': 
            valA = new Date(a.leaveDate + 'T' + (a.leaveTime || '00:00')).getTime(); 
            valB = new Date(b.leaveDate + 'T' + (b.leaveTime || '00:00')).getTime(); 
            break;
        case 'expectedReturnDate': 
            valA = new Date(a.expectedReturnDate + 'T' + (a.expectedReturnTime || '00:00')).getTime(); 
            valB = new Date(b.expectedReturnDate + 'T' + (b.expectedReturnTime || '00:00')).getTime(); 
            break;
        case 'actualReturnDate': 
            valA = a.actualReturnDate ? new Date(a.actualReturnDate + 'T' + (a.actualReturnTime || '00:00')).getTime() : 0; 
            valB = b.actualReturnDate ? new Date(b.actualReturnDate + 'T' + (b.actualReturnTime || '00:00')).getTime() : 0; 
            break;
        case 'durationMinutes': valA = a.durationMinutes || 0; valB = b.durationMinutes || 0; break;
        default: 
            valA = (a[rekapSortKey as keyof LeavePermitRecord] as any)?.toString() || '';
            valB = (b[rekapSortKey as keyof LeavePermitRecord] as any)?.toString() || '';
            break;
      }
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return rekapSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return rekapSortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [filteredRekapData, rekapSortKey, rekapSortDirection]);

  const handleSortRekap = (key: SortKeyRekap) => {
    if (rekapSortKey === key) {
      setRekapSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setRekapSortKey(key);
      setRekapSortDirection('asc');
    }
  };

  const getSortIndicator = (key: SortKeyRekap) => {
    if (rekapSortKey !== key) return '↕';
    return rekapSortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">Manajemen Perizinan Santri</h2>
        <p className="text-sm text-base-content/70">Kelola izin keluar, kepulangan, dan rekapitulasi perizinan santri.</p>
      </div>

      {/* Tabs */}
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
            {tab === 'form' ? 'Form & Santri Izin' : 'Rekapitulasi Perizinan'}
          </button>
        ))}
      </div>

      {/* Form & Santri Izin Tab Content */}
      {activeTab === 'form' && (
        <div className="space-y-8 mt-6">
          <section className="p-6 bg-base-200/50 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-neutral-content mb-4">Formulir Izin Santri</h3>
            <form onSubmit={handleSubmitPermit} className="space-y-4">
              <div>
                <label htmlFor="santriSearchTerm" className={labelClass}>Cari Santri (Nama/KTT):</label>
                <div className="relative">
                  <input
                    type="text"
                    id="santriSearchTerm"
                    value={santriSearchTerm}
                    onChange={(e) => {
                        setSantriSearchTerm(e.target.value);
                        if (selectedSantriId && e.target.value === '') setSelectedSantriId(''); 
                    }}
                    className={inputClass}
                    placeholder="Ketik Nama atau Nomor KTT Santri Aktif..."
                  />
                  {santriSearchTerm && filteredActiveSantriForSearch.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {filteredActiveSantriForSearch.map(s => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSantriId(s.id);
                              setSantriSearchTerm(`${s.namalengkap} (${s.nomorktt || 'No KTT'})`);
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
                {selectedSantriDetails && (
                    <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md">
                        Santri terpilih: <strong>{selectedSantriDetails.namalengkap}</strong> (KTT: {selectedSantriDetails.nomorktt || '-'}, Kelas: {selectedSantriDetails.namaKelas})
                    </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="leaveType" className={labelClass}>Jenis Izin:</label>
                  <select id="leaveType" value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} className={inputClass}>
                    {daftarLeaveType.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="reason" className={labelClass}>
                        {leaveType === LeaveType.IZIN_KELUAR_SEMENTARA ? "Tujuan/Keperluan Singkat (Opsional):" : "Alasan Izin:"}
                        {(leaveType === LeaveType.PULANG_KE_RUMAH || leaveType === LeaveType.IZIN_KEPERLUAN_PESANTREN) && <span className="text-red-500">*</span>}
                    </label>
                    <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={2} className={inputClass} placeholder="Jelaskan tujuan atau alasan izin..."></textarea>
                </div>
                 <div>
                  <label htmlFor="leaveDate" className={labelClass}>Tanggal Izin:</label>
                  <input type="date" id="leaveDate" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} className={inputClass} />
                </div>
                {leaveType === LeaveType.IZIN_KELUAR_SEMENTARA && (
                    <div>
                        <label htmlFor="leaveTime" className={labelClass}>Waktu Keluar <span className="text-red-500">*</span>:</label>
                        <input type="time" id="leaveTime" value={leaveTime} onChange={e => setLeaveTime(e.target.value)} className={inputClass} required/>
                    </div>
                )}
                {leaveType !== LeaveType.IZIN_KELUAR_SEMENTARA && (
                    <div>
                      <label htmlFor="expectedReturnDate" className={labelClass}>Estimasi Tanggal Kembali:</label>
                      <input type="date" id="expectedReturnDate" value={expectedReturnDate} onChange={e => setExpectedReturnDate(e.target.value)} className={inputClass} />
                    </div>
                )}
                 {leaveType === LeaveType.IZIN_KELUAR_SEMENTARA && (
                    <div>
                        <label htmlFor="expectedReturnTime" className={labelClass}>Estimasi Waktu Kembali <span className="text-red-500">*</span>:</label>
                        <input type="time" id="expectedReturnTime" value={expectedReturnTime} onChange={e => setExpectedReturnTime(e.target.value)} className={inputClass} required/>
                    </div>
                )}
              </div>
              <div className="flex justify-end">
                <button type="submit" className={buttonClass('primary')} disabled={isSubmittingPermit || !selectedSantriId}>
                  <PlusIcon className="w-5 h-5"/>
                  {isSubmittingPermit ? 'Memproses...' : 'Berikan Izin'}
                </button>
              </div>
            </form>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-neutral-content mb-4 pt-4 border-t border-base-300">Daftar Santri Sedang Izin</h3>
            {santriOnLeave.length === 0 ? (
              <div className="p-6 bg-base-200/50 rounded-lg shadow text-center">
                <InformationCircleIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-neutral-content font-semibold">Tidak ada santri yang sedang izin saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {santriOnLeave.map(permit => (
                  <div key={permit.id} className="p-4 border border-slate-300 rounded-lg shadow-sm bg-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div>
                            <p className="font-semibold text-secondary">{permit.santriName} <span className="text-xs text-slate-500">({permit.santriKTT || 'No KTT'} - {permit.santriKelas || 'N/A'})</span></p>
                            <p className="text-sm text-slate-600">Jenis Izin: <span className="font-medium">{permit.leaveType}</span></p>
                            {permit.reason && <p className="text-xs text-slate-500 mt-0.5 italic">Alasan/Tujuan: {permit.reason}</p>}
                        </div>
                        <div className="text-sm text-slate-700 text-left sm:text-right">
                            <p>Izin: {formatDateWithTime(permit.leaveDate, permit.leaveTime)}</p>
                            <p>Estimasi Kembali: {formatDateWithTime(permit.expectedReturnDate, permit.expectedReturnTime)}</p>
                        </div>
                    </div>
                    {permitToMarkReturn?.id === permit.id ? (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 bg-slate-50 p-3 rounded-md">
                             <h4 className="text-sm font-semibold text-neutral-content mb-1">Formulir Kedatangan Kembali: <span className="text-secondary">{permit.santriName}</span></h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor={`actualReturnDate-${permit.id}`} className={`${labelClass} text-xs`}>Tanggal Kembali Aktual:</label>
                                    <input 
                                        type="date" 
                                        id={`actualReturnDate-${permit.id}`}
                                        value={actualReturnDateInput} 
                                        onChange={e => setActualReturnDateInput(e.target.value)} 
                                        className={`${inputClass} text-xs py-1.5`}
                                    />
                                </div>
                                {(permit.leaveType === LeaveType.IZIN_KELUAR_SEMENTARA || permit.leaveTime) && (
                                    <div>
                                        <label htmlFor={`actualReturnTime-${permit.id}`} className={`${labelClass} text-xs`}>Waktu Kembali Aktual <span className="text-red-500">*</span>:</label>
                                        <input 
                                            type="time" 
                                            id={`actualReturnTime-${permit.id}`}
                                            value={actualReturnTimeInput} 
                                            onChange={e => setActualReturnTimeInput(e.target.value)} 
                                            className={`${inputClass} text-xs py-1.5`}
                                            required={permit.leaveType === LeaveType.IZIN_KELUAR_SEMENTARA}
                                        />
                                    </div>
                                )}
                            </div>
                             <div className="flex gap-2 justify-end mt-1">
                                <button onClick={handleCancelMarkReturn} className={`${buttonClass('secondary', 'sm')} !py-1 !px-2.5`}>Batal</button>
                                <button onClick={handleSubmitReturn} className={`${buttonClass('primary', 'sm')} !py-1 !px-2.5`} disabled={isSubmittingReturn}>
                                    <CheckCircleIcon className="w-4 h-4" />
                                    {isSubmittingReturn ? 'Menyimpan...' : 'Simpan Kembali'}
                                </button>
                             </div>
                        </div>
                    ) : (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                            <button onClick={() => handleOpenMarkReturn(permit)} className={`${buttonClass('primary', 'sm')} !py-1 !px-2.5`} >
                                <ArrowPathIcon className="w-4 h-4"/>
                                Tandai Sudah Kembali
                            </button>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Rekapitulasi Perizinan Tab Content */}
      {activeTab === 'rekap' && (
        <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="rekapStartDate" className={labelClass}>Dari Tanggal Izin:</label>
                    <input type="date" id="rekapStartDate" value={rekapStartDate} onChange={e => setRekapStartDate(e.target.value)} className={inputClass}/>
                </div>
                <div>
                    <label htmlFor="rekapEndDate" className={labelClass}>Sampai Tanggal Izin:</label>
                    <input type="date" id="rekapEndDate" value={rekapEndDate} onChange={e => setRekapEndDate(e.target.value)} className={inputClass}/>
                </div>
                <div>
                    <label htmlFor="rekapLeaveTypeFilter" className={labelClass}>Jenis Izin:</label>
                    <select id="rekapLeaveTypeFilter" value={rekapLeaveTypeFilter} onChange={e => setRekapLeaveTypeFilter(e.target.value as LeaveType | '')} className={inputClass}>
                        <option value="">Semua Jenis</option>
                        {daftarLeaveType.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="rekapStatusFilter" className={labelClass}>Status Izin:</label>
                    <select id="rekapStatusFilter" value={rekapStatusFilter} onChange={e => setRekapStatusFilter(e.target.value as LeavePermitStatus | '')} className={inputClass}>
                        <option value="">Semua Status</option>
                        {daftarLeavePermitStatus.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                <div className="lg:col-span-4">
                     <label htmlFor="rekapSantriSearch" className={labelClass}>Cari Santri (Nama/KTT):</label>
                     <input type="text" id="rekapSantriSearch" value={rekapSantriSearch} onChange={e => setRekapSantriSearch(e.target.value)} className={inputClass} placeholder="Ketik nama atau KTT..."/>
                </div>
            </div>

            {sortedRekapData.length === 0 ? (
                <div className="p-10 bg-base-200/50 rounded-lg shadow text-center border-2 border-dashed border-base-300">
                    <InformationCircleIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-content">Tidak Ada Data Perizinan</h3>
                    <p className="text-base-content/70">Tidak ada data perizinan yang cocok dengan filter yang dipilih.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow border border-base-300">
                    <table className="min-w-full divide-y divide-base-300">
                        <thead className="bg-base-200">
                            <tr>
                                {([
                                    { key: 'santriName', label: 'Nama Santri' },
                                    { key: 'santriKTT', label: 'KTT' },
                                    { key: 'santriKelas', label: 'Kelas' },
                                    { key: 'leaveType', label: 'Jenis Izin' },
                                    { key: 'reason', label: 'Alasan/Tujuan' },
                                    { key: 'leaveDate', label: 'Waktu Izin' },
                                    { key: 'expectedReturnDate', label: 'Estimasi Kembali' },
                                    { key: 'actualReturnDate', label: 'Aktual Kembali' },
                                    { key: 'durationMinutes', label: 'Durasi' },
                                    { key: 'status', label: 'Status' },
                                    { key: 'recordedBy', label: 'Dicatat Oleh' },
                                ] as {key: SortKeyRekap, label: string}[]).map(col => (
                                    <th key={col.key} scope="col" className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-neutral-content cursor-pointer hover:bg-base-300" onClick={() => handleSortRekap(col.key)}>
                                        {col.label} {getSortIndicator(col.key)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-200 bg-base-100">
                            {sortedRekapData.map(permit => (
                                <tr key={permit.id} className="hover:bg-base-200/30 transition-colors duration-150">
                                    <td className="px-3 py-3 text-xs sm:text-sm font-medium text-neutral-content">{permit.santriName}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{permit.santriKTT || '-'}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{permit.santriKelas || '-'}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{permit.leaveType}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content max-w-xs truncate" title={permit.reason}>{permit.reason || '-'}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{formatDateWithTime(permit.leaveDate, permit.leaveTime)}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{formatDateWithTime(permit.expectedReturnDate, permit.expectedReturnTime)}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{formatDateWithTime(permit.actualReturnDate, permit.actualReturnTime)}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-center text-base-content">{formatDurationFromMinutes(permit.durationMinutes)}</td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-center">
                                        <span className={`px-2 py-0.5 rounded-full font-semibold ${permit.status === LeavePermitStatus.IZIN ? 'bg-yellow-100 text-yellow-700' : permit.status === LeavePermitStatus.KEMBALI ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {permit.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-xs sm:text-sm text-base-content">{permit.recordedBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default PerizinanSantriView;
