
import React from 'react';
import { IqsamExam, IqsamSessionStatus, UserRole, KelasRecord } from '../types'; // Changed IqsamSession to IqsamExam
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import EyeIcon from './icons/EyeIcon'; 
import DocumentTextIcon from './icons/DocumentTextIcon'; 

interface IqsamSessionsViewProps {
  sessions: IqsamExam[]; // Changed IqsamSession to IqsamExam
  kelasRecords: KelasRecord[];
  onAddSession: () => void;
  onEditSession: (session: IqsamExam) => void; // Changed IqsamSession to IqsamExam
  onDeleteSession: (sessionId: string) => void;
  onNavigateToRegistrations: (sessionId: string) => void;
  onNavigateToScores: (sessionId: string) => void;
  currentUserRole: UserRole;
}

const IqsamSessionsView: React.FC<IqsamSessionsViewProps> = ({
  sessions,
  kelasRecords,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onNavigateToRegistrations,
  onNavigateToScores,
  currentUserRole,
}) => {
  const isAdminOrSekretariat = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.SEKRETARIAT_SANTRI;

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateString; }
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    return ` (${timeString})`;
  }
  
  const getStatusBadgeClass = (status?: IqsamSessionStatus) => { // Added optional chaining for status
    if (!status) return 'bg-gray-100 text-gray-700'; // Default if status is undefined
    switch (status) {
      case IqsamSessionStatus.PENDAFTARAN_DIBUKA: return 'bg-green-100 text-green-700';
      case IqsamSessionStatus.PENDAFTARAN_DITUTUP: return 'bg-yellow-100 text-yellow-700';
      case IqsamSessionStatus.SEDANG_BERLANGSUNG: return 'bg-blue-100 text-blue-700';
      case IqsamSessionStatus.SELESAI: return 'bg-slate-100 text-slate-700';
      case IqsamSessionStatus.DIBATALKAN: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getKelasName = (kelasId: string) => {
    const kelas = kelasRecords.find(k => k.id === kelasId);
    return kelas ? kelas.namaKelas : 'N/A';
  };

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-3 sm:mb-0">
          Manajemen Sesi Iqsam
        </h2>
        {isAdminOrSekretariat && (
          <button onClick={onAddSession} className="flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-neutral text-sm">
            <PlusIcon className="w-5 h-5" /> Tambah Sesi Iqsam
          </button>
        )}
      </div>

      {sessions.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow border border-base-300">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Kelas</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Periode</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Th. Ajaran</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Tgl & Jam Ujian</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Registrasi</th>
                <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-neutral-content">Status</th>
                <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-neutral-content">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 bg-base-100">
              {sessions.sort((a,b) => new Date(b.tanggalUjian).getTime() - new Date(a.tanggalUjian).getTime()).map(session => (
                <tr key={session.id} className="hover:bg-base-200/50 transition-colors duration-150">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-neutral-content">{getKelasName(session.kelasId)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{session.periode}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{session.tahunAjaran}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">
                    {formatDate(session.tanggalUjian)}
                    {session.jamMulaiUjian && <span className="text-xs">{formatTime(session.jamMulaiUjian)}</span>}
                    {session.jamSelesaiUjian && <span className="text-xs"> - {session.jamSelesaiUjian}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{formatDate(session.tanggalBukaPendaftaran)} - {formatDate(session.tanggalTutupPendaftaran)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(session.status)}`}>
                      {session.status || 'N/A'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                    <div className="flex justify-center items-center space-x-1 sm:space-x-2">
                      {(isAdminOrSekretariat || currentUserRole === UserRole.ASATIDZ) && (
                        <button onClick={() => onNavigateToScores(session.id)} className="p-1.5 text-sky-600 hover:text-sky-800 bg-sky-100 hover:bg-sky-200 rounded-md shadow-sm" title="Kelola Nilai & Kehadiran">
                          <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                      {isAdminOrSekretariat && session.status === IqsamSessionStatus.PENDAFTARAN_DIBUKA && (
                        <button onClick={() => onNavigateToRegistrations(session.id)} className="p-1.5 text-purple-600 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 rounded-md shadow-sm" title="Pendaftaran Santri">
                          <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                      {isAdminOrSekretariat && (
                        <>
                          <button onClick={() => onEditSession(session)} className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-md shadow-sm" title="Edit Sesi">
                            <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button onClick={() => onDeleteSession(session.id)} className="p-1.5 text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded-md shadow-sm" title="Hapus Sesi">
                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-base-200 rounded-lg shadow">
          <DocumentTextIcon className="mx-auto h-16 w-16 text-slate-400 mb-5" />
          <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Sesi Iqsam</h3>
          {isAdminOrSekretariat && <p className="mt-1 text-sm text-base-content/70">Silakan tambahkan sesi Iqsam baru untuk memulai.</p>}
        </div>
      )}
    </div>
  );
};

export default IqsamSessionsView;
