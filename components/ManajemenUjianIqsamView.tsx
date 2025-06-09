
import React, { useState, useMemo } from 'react';
import { 
  Santri, 
  KelasRecord, 
  IqsamExam, 
  IqsamScoreRecord, 
  IqsamRegistrationRecord,
  IqsamResult,
  UserRole,
  SupabaseDefaultFields,
  IqsamSubjectScore,
  AttendanceStatus
} from '../types';

import IqsamSessionsView from './IqsamSessionsView';
import IqsamSessionFormModal from './IqsamSessionFormModal';
import IqsamRegistrationView from './IqsamRegistrationView';
import IqsamAttendanceAndScoresView from './IqsamAttendanceAndScoresView';
import IqsamNilaiPerSantriModal from './IqsamNilaiPerSantriModal';
import PlusIcon from './icons/PlusIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon'; // Assuming you have or will create this

type IqsamExamPayload = Omit<IqsamExam, SupabaseDefaultFields>;
type IqsamScorePayload = Omit<IqsamScoreRecord, SupabaseDefaultFields>; // Includes lastUpdatedAt
type IqsamResultPayload = Omit<IqsamResult, SupabaseDefaultFields>; // Includes lastUpdated


interface ManajemenUjianIqsamViewProps {
  activeSantriList: Santri[];
  kelasRecords: KelasRecord[];
  iqsamExams: IqsamExam[];
  iqsamScoreRecords: IqsamScoreRecord[];
  iqsamRegistrations: IqsamRegistrationRecord[]; // Added for IqsamRegistrationView
  iqsamResults: IqsamResult[]; // Added for IqsamAttendanceAndScoresView & IqsamNilaiPerSantriModal
  onSaveExam: (exam: IqsamExamPayload, existingExamId?: string) => string;
  onSaveScores: (scores: IqsamScorePayload[]) => void; // This is for individual score records
  onSaveResult: (result: IqsamResultPayload) => void; // Added for saving aggregate results
  onDeleteExamAndScores: (examId: string) => void;
  onRegisterSantriForIqsam: (iqsamSessionId: string, santriIds: string[]) => void; // Added
  onCancelIqsamRegistration: (registrationId: string) => void; // Added
  currentUserRole: UserRole;
}

type ViewMode = 'list_sessions' | 'registrations' | 'scores';

const ManajemenUjianIqsamView: React.FC<ManajemenUjianIqsamViewProps> = ({
  activeSantriList,
  kelasRecords,
  iqsamExams,
  iqsamScoreRecords, // Keep for potential direct use or rekap
  iqsamRegistrations,
  iqsamResults,
  onSaveExam,
  onSaveScores, // Keep if used for batch raw scores
  onSaveResult, // Use this for IqsamAttendanceAndScoresView
  onDeleteExamAndScores,
  onRegisterSantriForIqsam,
  onCancelIqsamRegistration,
  currentUserRole,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list_sessions');
  const [selectedExam, setSelectedExam] = useState<IqsamExam | null>(null);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<IqsamExam | null>(null);

  const [isNilaiModalOpen, setIsNilaiModalOpen] = useState(false);
  const [nilaiModalData, setNilaiModalData] = useState<{
    iqsamRegistrationId: string;
    santriId: string;
    santriName: string;
    iqsamSessionId: string; // This is the examId
    existingResult?: IqsamResult | null;
  } | null>(null);

  const handleAddSession = () => {
    setExamToEdit(null);
    setIsSessionFormOpen(true);
  };

  const handleEditSession = (session: IqsamExam) => {
    setExamToEdit(session);
    setIsSessionFormOpen(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus sesi Iqsam ini beserta semua data pendaftaran dan nilainya?')) {
      onDeleteExamAndScores(sessionId);
    }
  };
  
  const handleNavigateToRegistrations = (sessionId: string) => {
    const exam = iqsamExams.find(e => e.id === sessionId);
    if (exam) {
      setSelectedExam(exam);
      setViewMode('registrations');
    }
  };

  const handleNavigateToScores = (sessionId: string) => {
    const exam = iqsamExams.find(e => e.id === sessionId);
    if (exam) {
      setSelectedExam(exam);
      setViewMode('scores');
    }
  };

  const handleBackToList = () => {
    setSelectedExam(null);
    setViewMode('list_sessions');
  };

  const handleOpenNilaiModal = (
    iqsamRegistrationId: string, 
    santriId: string, 
    santriName: string,
    iqsamSessionId: string // examId
  ) => {
    const existingRes = iqsamResults.find(r => r.iqsamRegistrationId === iqsamRegistrationId && r.santriId === santriId && r.iqsamSessionId === iqsamSessionId);
    setNilaiModalData({ iqsamRegistrationId, santriId, santriName, iqsamSessionId, existingResult: existingRes });
    setIsNilaiModalOpen(true);
  };

  const pageTitle = useMemo(() => {
    if (viewMode === 'registrations' && selectedExam) {
      const kelas = kelasRecords.find(k => k.id === selectedExam.kelasId);
      return `Pendaftaran Iqsam: ${kelas?.namaKelas} - ${selectedExam.periode} ${selectedExam.tahunAjaran}`;
    }
    if (viewMode === 'scores' && selectedExam) {
      const kelas = kelasRecords.find(k => k.id === selectedExam.kelasId);
      return `Nilai Iqsam: ${selectedExam.mataPelajaran} (${kelas?.namaKelas} - ${selectedExam.periode} ${selectedExam.tahunAjaran})`;
    }
    return 'Manajemen Ujian Iqsam';
  }, [viewMode, selectedExam, kelasRecords]);
  
  const handleInternalSaveResult = (resultData: IqsamResultPayload) => {
    onSaveResult(resultData);
  };


  if (viewMode === 'registrations' && selectedExam) {
    return (
      <div>
        <button onClick={handleBackToList} className="mb-4 flex items-center gap-2 text-sm text-secondary hover:underline">
          <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Daftar Sesi
        </button>
        <IqsamRegistrationView
          iqsamSessions={[selectedExam]} // Pass only the selected session
          activeSantriList={activeSantriList}
          iqsamRegistrations={iqsamRegistrations.filter(r => r.iqsamSessionId === selectedExam.id)}
          onRegisterSantri={onRegisterSantriForIqsam}
          onCancelRegistration={onCancelIqsamRegistration}
          kelasRecords={kelasRecords}
        />
      </div>
    );
  }

  if (viewMode === 'scores' && selectedExam) {
    return (
      <div>
        <button onClick={handleBackToList} className="mb-4 flex items-center gap-2 text-sm text-secondary hover:underline">
          <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Daftar Sesi
        </button>
        <IqsamAttendanceAndScoresView
          iqsamSession={selectedExam}
          iqsamRegistrations={iqsamRegistrations.filter(r => r.iqsamSessionId === selectedExam.id)}
          iqsamResults={iqsamResults} 
          activeSantriList={activeSantriList}
          onSaveResult={handleInternalSaveResult} 
          onOpenNilaiModal={handleOpenNilaiModal}
          kelasRecords={kelasRecords}
          currentUserRole={currentUserRole}
          pageTitle={pageTitle}
        />
         {nilaiModalData && (
          <IqsamNilaiPerSantriModal
            isOpen={isNilaiModalOpen}
            onClose={() => setIsNilaiModalOpen(false)}
            {...nilaiModalData}
            onSaveIqsamResult={handleInternalSaveResult}
          />
        )}
      </div>
    );
  }

  // Default view: list_sessions
  return (
    <>
      <IqsamSessionsView
        sessions={iqsamExams}
        kelasRecords={kelasRecords}
        onAddSession={handleAddSession}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
        onNavigateToRegistrations={handleNavigateToRegistrations}
        onNavigateToScores={handleNavigateToScores}
        currentUserRole={currentUserRole}
      />
      {isSessionFormOpen && (
        <IqsamSessionFormModal
          isOpen={isSessionFormOpen}
          onClose={() => setIsSessionFormOpen(false)}
          onSubmit={(data, id) => {
            onSaveExam(data, id);
            setIsSessionFormOpen(false);
          }}
          initialData={examToEdit}
          kelasRecords={kelasRecords}
        />
      )}
    </>
  );
};

export default ManajemenUjianIqsamView;
