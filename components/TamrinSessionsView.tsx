
import React from 'react';
import { TamrinExam, User, KelasRecord, UserRole } from '../types'; // Changed TamrinSession to TamrinExam
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface TamrinSessionsViewProps {
  sessions: TamrinExam[]; // Changed TamrinSession to TamrinExam
  asatidzList: User[]; 
  kelasRecords: KelasRecord[]; 
  onAddSession: () => void;
  onEditSession: (session: TamrinExam) => void; // Changed TamrinSession to TamrinExam
  onDeleteSession: (sessionId: string) => void;
  onNavigateToScores: (sessionId: string) => void;
  currentUserRole: UserRole;
}

const TamrinSessionsView: React.FC<TamrinSessionsViewProps> = ({
  sessions,
  asatidzList,
  kelasRecords,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onNavigateToScores,
  currentUserRole,
}) => {
  const isAdminOrAsatidz = currentUserRole === UserRole.ADMINISTRATOR_UTAMA || currentUserRole === UserRole.ASATIDZ;

  const getKelasName = (kelasId: string) => kelasRecords.find(k => k.id === kelasId)?.namaKelas || 'N/A';
  const getAsatidzName = (asatidzId: string) => asatidzList.find(a => a.id === asatidzId)?.namaLengkap || 'N/A';
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); } 
    catch { return dateString; }
  };

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-base-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-content mb-3 sm:mb-0">
          Manajemen Sesi Tamrin
        </h2>
        {isAdminOrAsatidz && (
          <button onClick={onAddSession} className="flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-neutral text-sm">
            <PlusIcon className="w-5 h-5" /> Tambah Sesi Tamrin
          </button>
        )}
      </div>

      {sessions.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow border border-base-300">
          <table className="min-w-full divide-y divide-base-300">
            <thead className="bg-base-200">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Nama Tamrin</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Kelas</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Asatidz</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-neutral-content">Tgl Pelaksanaan</th>
                <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-neutral-content">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 bg-base-100">
              {sessions.sort((a,b) => new Date(b.tanggalPelaksanaan).getTime() - new Date(a.tanggalPelaksanaan).getTime()).map(session => (
                <tr key={session.id} className="hover:bg-base-200/50 transition-colors duration-150">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-neutral-content">{session.namaTamrin}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{getKelasName(session.kelasId)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{getAsatidzName(session.asatidzId)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-base-content">{formatDate(session.tanggalPelaksanaan)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                    <div className="flex justify-center items-center space-x-1 sm:space-x-2">
                      <button onClick={() => onNavigateToScores(session.id)} className="p-1.5 text-sky-600 hover:text-sky-800 bg-sky-100 hover:bg-sky-200 rounded-md shadow-sm" title="Kelola Nilai & Kehadiran">
                        <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {isAdminOrAsatidz && (
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
          <h3 className="text-xl font-semibold text-neutral-content">Belum Ada Sesi Tamrin</h3>
          {isAdminOrAsatidz && <p className="mt-1 text-sm text-base-content/70">Silakan tambahkan sesi Tamrin baru untuk memulai.</p>}
        </div>
      )}
    </div>
  );
};

export default TamrinSessionsView;
