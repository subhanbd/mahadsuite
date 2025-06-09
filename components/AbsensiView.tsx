
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Santri, AttendanceRecord, AttendanceStatus, UserRole, KelasRecord, SupabaseDefaultFields } from '../types'; 
import UserIcon from './icons/UserIcon'; 
import CheckCircleIcon from './icons/CheckCircleIcon'; 
import InformationCircleIcon from './icons/InformationCircleIcon';

type AttendanceRecordPayload = Omit<AttendanceRecord, SupabaseDefaultFields | 'recordedAt' >;


interface AbsensiViewProps {
  activeSantriList: Santri[];
  allAttendanceRecords: AttendanceRecord[];
  onSaveAttendance: (recordsToSave: AttendanceRecordPayload[]) => void;
  currentUserRole: UserRole;
  kelasRecords: KelasRecord[]; 
}

const AbsensiView: React.FC<AbsensiViewProps> = ({ 
    activeSantriList, 
    allAttendanceRecords, 
    onSaveAttendance,
    currentUserRole,
    kelasRecords 
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentAttendance, setCurrentAttendance] = useState<Map<string, { status: AttendanceStatus, notes: string }>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedKelasFilterId, setSelectedKelasFilterId] = useState<string>("Semua Kelas"); 
  
  const prevSelectedDateRef = useRef<string>(selectedDate);
  const prevActiveSantriListRef = useRef<Santri[]>(activeSantriList);
  const prevAllAttendanceRecordsRef = useRef<AttendanceRecord[]>(allAttendanceRecords);


  useEffect(() => {
    const dateChanged = selectedDate !== prevSelectedDateRef.current;
    const activeListContentChanged = JSON.stringify(activeSantriList) !== JSON.stringify(prevActiveSantriListRef.current);
    const attendanceRecordsContentChanged = JSON.stringify(allAttendanceRecords) !== JSON.stringify(prevAllAttendanceRecordsRef.current);

    if (dateChanged || activeListContentChanged || attendanceRecordsContentChanged) {
        const newAttendanceMap = new Map<string, { status: AttendanceStatus, notes: string }>();
        const listToIterate = Array.isArray(activeSantriList) ? activeSantriList : [];
        const recordsToSearch = Array.isArray(allAttendanceRecords) ? allAttendanceRecords : [];

        listToIterate.forEach(santri => {
            if (!santri || !santri.id) return;
            const existingRecord = recordsToSearch.find(r => r.santriId === santri.id && r.date === selectedDate);
            if (dateChanged || attendanceRecordsContentChanged) {
                if (existingRecord) { newAttendanceMap.set(santri.id, { status: existingRecord.status, notes: existingRecord.notes || '' });
                } else { newAttendanceMap.set(santri.id, { status: AttendanceStatus.HADIR, notes: '' }); }
            } 
            else if (activeListContentChanged) {
                const currentLocalEntry = currentAttendance.get(santri.id);
                if (currentLocalEntry) { newAttendanceMap.set(santri.id, currentLocalEntry);
                } else if (existingRecord) { newAttendanceMap.set(santri.id, { status: existingRecord.status, notes: existingRecord.notes || '' });
                } else { newAttendanceMap.set(santri.id, { status: AttendanceStatus.HADIR, notes: '' }); }
            }
        });
        
        if (dateChanged || attendanceRecordsContentChanged || (activeListContentChanged && (newAttendanceMap.size > 0 || listToIterate.length === 0))) {
           setCurrentAttendance(newAttendanceMap);
        }
        if (dateChanged) prevSelectedDateRef.current = selectedDate;
        if (activeListContentChanged) prevActiveSantriListRef.current = activeSantriList;
        if (attendanceRecordsContentChanged) prevAllAttendanceRecordsRef.current = allAttendanceRecords;
    }
  }, [selectedDate, activeSantriList, allAttendanceRecords, currentAttendance]);

  const handleStatusChange = (santriId: string, newStatus: AttendanceStatus) => { 
    setCurrentAttendance(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(santriId) || { status: AttendanceStatus.HADIR, notes: ''};
      newMap.set(santriId, { ...currentEntry, status: newStatus });
      return newMap;
    });
  };
  const handleNotesChange = (santriId: string, notes: string) => { 
     setCurrentAttendance(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(santriId) || { status: AttendanceStatus.HADIR, notes: ''};
      newMap.set(santriId, { ...currentEntry, notes });
      return newMap;
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    const recordsToSave: AttendanceRecordPayload[] = [];
    currentAttendance.forEach(({ status, notes }, santriId) => {
      const santriExists = activeSantriList.find(s => s.id === santriId);
      if (santriExists) {
        recordsToSave.push({ 
            santriId, 
            date: selectedDate, 
            status, 
            notes: notes || '', 
            recordedBy: currentUserRole.toString(), 
        });
      }
    });
    onSaveAttendance(recordsToSave);
    setTimeout(() => { setIsSaving(false); console.log('Absensi berhasil disimpan!'); }, 500);
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.HADIR: return 'text-green-600';
      case AttendanceStatus.SAKIT: return 'text-yellow-600';
      case AttendanceStatus.IZIN: return 'text-blue-600';
      case AttendanceStatus.ALPA: return 'text-red-600';
      default: return 'text-slate-600';
    }
  };
  const getStatusTextColor = (status: AttendanceStatus): string => {
     switch (status) {
      case AttendanceStatus.HADIR: return 'text-green-700 font-semibold';
      case AttendanceStatus.SAKIT: return 'text-yellow-700 font-semibold';
      case AttendanceStatus.IZIN: return 'text-blue-700 font-semibold';
      case AttendanceStatus.ALPA: return 'text-red-700 font-semibold';
      default: return 'text-neutral-content/80';
    }
  };

  const uniqueKelasOptions = useMemo(() => {
    if (!Array.isArray(activeSantriList) || !Array.isArray(kelasRecords)) return [{ id: "Semua Kelas", namaKelas: "Semua Kelas" }];
    const klasses = new Map<string, string>();
    activeSantriList.forEach(santri => {
        if (santri.kelasid) {
            const kelas = kelasRecords.find(k => k.id === santri.kelasid);
            if (kelas && !klasses.has(kelas.id)) {
                klasses.set(kelas.id, kelas.namaKelas);
            }
        }
    });
    const optionsFromMap = Array.from(klasses, ([id, namaKelas]) => ({ id, namaKelas }));
    // Sort by urutanTampilan, then by namaKelas
    return [{ id: "Semua Kelas", namaKelas: "Semua Kelas" }, ...optionsFromMap.sort((a,b) => {
        const kelasA = kelasRecords.find(k => k.id === a.id);
        const kelasB = kelasRecords.find(k => k.id === b.id);
        return (kelasA?.urutanTampilan ?? 99) - (kelasB?.urutanTampilan ?? 99) || a.namaKelas.localeCompare(b.namaKelas);
    })];
  }, [activeSantriList, kelasRecords]);


  const filteredSantriForDisplay = useMemo(() => {
    if (!Array.isArray(activeSantriList)) return [];
    if (selectedKelasFilterId === "Semua Kelas") {
        return activeSantriList; 
    }
    return activeSantriList.filter(santri => santri.kelasid === selectedKelasFilterId); 
  }, [activeSantriList, selectedKelasFilterId]);

  const inputClass = "mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent sm:text-sm text-neutral-content placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-neutral-content/90 mb-1";
  const radioBaseClass = "w-4 h-4 text-secondary focus:ring-secondary focus:ring-offset-0 form-radio";

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content">Input Absensi Santri</h2>
        <p className="text-sm text-base-content/70">Pilih tanggal dan kelas, lalu tandai status kehadiran setiap santri.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="attendanceDate" className={labelClass}>Tanggal Absensi:</label>
          <input type="date" id="attendanceDate" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="kelasFilter" className={labelClass}>Filter Kelas:</label>
          <select id="kelasFilter" value={selectedKelasFilterId} onChange={e => setSelectedKelasFilterId(e.target.value)} className={inputClass}>
            {uniqueKelasOptions.map(kelas => (<option key={kelas.id} value={kelas.id}>{kelas.namaKelas}</option>))}
          </select>
        </div>
      </div>
      {(!Array.isArray(activeSantriList) || activeSantriList.length === 0) ? (
       <div className="text-center py-12 bg-base-200 rounded-lg shadow"> <InformationCircleIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" /> <h3 className="text-xl font-semibold text-neutral-content">Tidak Ada Santri Aktif</h3> <p className="mt-1 text-sm text-base-content/70">Belum ada data santri dengan status "Aktif" untuk diabsen.</p> </div>
      ) : filteredSantriForDisplay.length === 0 && selectedKelasFilterId !== "Semua Kelas" ? (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow"> <InformationCircleIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" /> <h3 className="text-xl font-semibold text-neutral-content">Tidak Ada Santri di Kelas Ini</h3> <p className="mt-1 text-sm text-base-content/70">Tidak ada santri aktif yang cocok dengan filter kelas terpilih.</p> <p className="mt-1 text-sm text-base-content/60">Coba pilih "Semua Kelas" atau kelas lain.</p> </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg shadow border border-base-300">
            <table className="min-w-full divide-y divide-base-300">
                <thead className="bg-base-200"><tr><th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content w-1/4 sm:w-auto">Santri</th><th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content w-2/4 sm:w-auto">Status Kehadiran</th><th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content w-1/4 sm:w-auto">Catatan</th></tr></thead>
                <tbody className="divide-y divide-base-200 bg-base-100">
                    {filteredSantriForDisplay.map(santri => {
                        if (!santri || !santri.id) return null; 
                        const attendanceEntry = currentAttendance.get(santri.id);
                        const currentStatus = attendanceEntry ? attendanceEntry.status : AttendanceStatus.HADIR;
                        const currentNotes = attendanceEntry ? attendanceEntry.notes : '';
                        const namaKelas = kelasRecords.find(k => k.id === santri.kelasid)?.namaKelas || 'N/A'; 
                        return (
                            <tr key={santri.id} className="hover:bg-base-200/30 transition-colors duration-150">
                                <td className="px-4 py-4 align-top">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0"> {santri.pasfotourl ? (<img src={santri.pasfotourl} alt={santri.namalengkap} className="w-10 h-10 object-cover rounded-full shadow" />) : (<div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shadow"><UserIcon className="w-6 h-6 text-slate-400" /></div>)}</div>
                                        <div> <p className="font-medium text-neutral-content text-sm">{santri.namalengkap}</p> <p className="text-xs text-slate-500">{santri.nomorktt || 'No KTT: -'} ({namaKelas})</p> </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 align-top">
                                    <fieldset><legend className="sr-only">Status Kehadiran untuk {santri.namalengkap}</legend>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                                            {Object.values(AttendanceStatus).map(statusValue => (<div key={statusValue} className="flex items-center"> <input id={`${santri.id}-${statusValue}`} name={`status-${santri.id}`} type="radio" checked={currentStatus === statusValue} onChange={() => handleStatusChange(santri.id, statusValue)} className={`${radioBaseClass} ${getStatusColor(statusValue)} border-gray-300`}/> <label htmlFor={`${santri.id}-${statusValue}`} className={`ml-2 block text-sm font-medium ${currentStatus === statusValue ? getStatusTextColor(statusValue) : 'text-neutral-content/80'}`}>{statusValue}</label> </div>))}
                                        </div>
                                    </fieldset>
                                </td>
                                <td className="px-4 py-4 align-top"> <input type="text" value={currentNotes} onChange={(e) => handleNotesChange(santri.id, e.target.value)} placeholder="Catatan singkat..." className="w-full text-sm px-2 py-1.5 border border-slate-300 rounded-md focus:ring-secondary focus:border-secondary shadow-sm" aria-label={`Catatan untuk ${santri.namalengkap}`}/> </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          </div>
          <div className="pt-6 border-t border-base-300 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={isSaving || !Array.isArray(activeSantriList) || activeSantriList.length === 0 || filteredSantriForDisplay.length === 0} 
              className="flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? ( <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-secondary-content mr-2"></span>Menyimpan...</> ) : ( <><CheckCircleIcon className="w-5 h-5" />Simpan Absensi</> )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsensiView;
