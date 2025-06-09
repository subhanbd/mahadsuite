
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Client, Account, Databases, Storage, ID as AppwriteID_Type, Query as AppwriteQuery_Type, AppwriteException, Models 
} from 'appwrite'; 
import { 
  client as appwriteClient, 
  account as appwriteAccount, 
  databases as appwriteDatabases, 
  storage as appwriteStorage, 
  ID, 
  Query, 
  APPWRITE_DATABASE_ID, APPWRITE_BUCKET_ID_SANTRI_PHOTOS,
  COLLECTION_ID_SANTRI, COLLECTION_ID_USER_PROFILES, COLLECTION_ID_BILL_DEFINITIONS,
  COLLECTION_ID_SANTRI_PAYMENTS, COLLECTION_ID_ATTENDANCE_RECORDS, COLLECTION_ID_PESANTREN_PROFILE,
  COLLECTION_ID_LEAVE_PERMITS, COLLECTION_ID_CORET_KTT_RECORDS, COLLECTION_ID_KELAS_RECORDS,
  COLLECTION_ID_BLOK_RECORDS, COLLECTION_ID_IQSAM_EXAMS, COLLECTION_ID_IQSAM_SCORE_RECORDS,
  COLLECTION_ID_TAMRIN_EXAMS, COLLECTION_ID_TAMRIN_SCORE_RECORDS
} from './services/appwriteClient';
import { getDummySantriData } from './services/dummyData';
import { 
  Santri, AppView, SantriStatus, JenisKelamin, UserRole, userRoleDisplayNames, menuAccessConfig, 
  Kewarganegaraan, TingkatPendidikan, JenisPendidikanTerakhir, IdentitasWali, PilihanYaTidak, 
  StatusHidup, StatusKealumnian, StatusKeorganisasian, User, BillDefinition,
  SantriPaymentRecord, PaymentStatus, PaymentMethod, PaymentConfirmationData,
  AttendanceRecord, AttendanceSummary, RekapAbsensiPrintData, RekapFilterType, PesantrenProfileData,
  SantriDetailPrintData, LeavePermitRecord, LeaveType, LeavePermitStatus, CoretKttRecord,
  CoretKttPrintData, SantriDetailForCoretPrint, 
  KelasRecord, BlokRecord, 
  IqsamExam, IqsamScoreRecord, TamrinExam, TamrinScoreRecord, IqsamPeriodeRefactored, AttendanceStatus as UjianAttendanceStatus, AppwriteDocument,
  TamrinExamPayload, TamrinScorePayload
} from './types';

import Navbar from './components/Navbar'; 
import SantriList from './components/SantriList';
import SantriForm from './components/SantriForm';
import Modal from './components/Modal';
import ConfirmationModal from './components/ConfirmationModal';
import SearchBar from './components/SearchBar';
import DashboardView from './components/DashboardView';
import PlaceholderView from './components/PlaceholderView';
import UserManagementView from './components/RoleManagementView'; 
import UserFormModal from './components/UserFormModal';
import FinancialManagementView from './components/FinancialManagementView';
import BillDefinitionFormModal from './components/BillDefinitionFormModal';
import SantriPaymentManagementView from './components/SantriPaymentManagementView'; 
import SantriPaymentConfirmationModal from './components/SantriPaymentConfirmationModal'; 
import AbsensiView from './components/AbsensiView'; 
import RekapAbsensiView from './components/RekapAbsensiView'; 
import RekapAbsensiPrintout from './components/RekapAbsensiPrintout'; 
import PesantrenProfileView from './components/PesantrenProfileView'; 
import SantriDetailPrintout from './components/SantriDetailPrintout'; 
import AboutUsModal from './components/AboutUsModal'; 
import PerizinanSantriView from './components/PerizinanSantriView'; 
import CoretKttView from './components/CoretKttView';
import { CoretKttPrintout } from './components/CoretKttPrintout';
import KelasManagementView from './components/KelasManagementView'; 
import KelasFormModal from './components/KelasFormModal'; 
import BlokManagementView from './components/BlokManagementView'; 
import BlokFormModal from './components/BlokFormModal'; 
import KetuaBlokListView from './components/KetuaBlokListView'; 
import PlusIcon from './components/icons/PlusIcon';
import MenuIcon from './components/icons/MenuIcon';
import XIcon from './components/icons/XIcon';
import PaymentReceipt from './components/PaymentReceipt';
import ManajemenUjianIqsamView from './components/ManajemenUjianIqsamView';
import ManajemenUjianTamrinView from './components/ManajemenUjianTamrinView';
import DatabaseIcon from './components/icons/DatabaseIcon';


declare global {
  interface Window {
    html2pdf: any; 
  }
}

function mapDocumentToType<T extends AppwriteDocument & { id: string }>(doc: Models.Document): T {
  const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...attributes } = doc;
  // Ensure all $properties are present
  const appwriteSystemProps = {
    $id,
    $collectionId,
    $databaseId,
    $createdAt,
    $updatedAt,
    $permissions,
  };
  return {
    id: $id, // Custom id mapping
    ...appwriteSystemProps, // Spread the system properties
    ...attributes,        // Spread the custom attributes
  } as unknown as T;     // Use 'as unknown as T' for a less strict cast
}


const pageTitles: Record<AppView, string> = {
  Dashboard: 'Dashboard',
  DataSantri: 'Data Santri Aktif',
  DataAlumni: 'Data Alumni',
  DataMunjiz: 'Data Santri Munjiz', 
  Absensi: 'Manajemen Absensi Santri', 
  RekapAbsensi: 'Rekapitulasi Absensi Santri', 
  UserManagement: 'Manajemen Pengguna',
  FinancialManagement: 'Manajemen Jenis Tagihan',
  SantriPaymentManagement: 'Manajemen Pembayaran Santri', 
  PesantrenProfile: 'Profil Pesantren',
  PerizinanSantri: 'Manajemen Perizinan Santri', 
  CoretKtt: 'Coret Kartu Tanda Santri (KTT)',
  KelasManagement: 'Manajemen Kelas', 
  BlokManagement: 'Manajemen Blok',   
  KetuaBlokList: 'Daftar Ketua Blok & Statistik', 
  ManajemenUjianIqsam: 'Ujian Iqsam: Input Nilai & Rekap',
  ManajemenUjianTamrin: 'Ujian Tamrin: Input Nilai & Rekap',
};

const initialKelasRecordsData: Omit<KelasRecord, 'id' | keyof AppwriteDocument>[] = [ 
  { namaKelas: '0 (Sifr / I\'dad Lughowi)', urutanTampilan: 0, deskripsi: 'Kelas Persiapan Bahasa Arab' },
  { namaKelas: '1 (Wahid / Kelas 1 MTS)', urutanTampilan: 1 },
  { namaKelas: '2 (Ithnayn / Kelas 2 MTS)', urutanTampilan: 2 },
  { namaKelas: '3 (Thalātha / Kelas 3 MTS)', urutanTampilan: 3 },
  { namaKelas: '4 (Arba‘a / Kelas 1 MA)', urutanTampilan: 4 },
  { namaKelas: '5 (Khamsa / Kelas 2 MA)', urutanTampilan: 5 },
  { namaKelas: '6 (Sitta / Kelas 3 MA)', urutanTampilan: 6 },
  { namaKelas: 'Takhasus', urutanTampilan: 7, deskripsi: 'Kelas Khusus Pendalaman Materi' },
  { namaKelas: 'Lainnya', urutanTampilan: 8 },
];

const initialBlokRecordsData: Omit<BlokRecord, 'id' | keyof AppwriteDocument>[] = [ 
  { namaBlok: 'Blok A (Putra)', jumlahKamar: 10, deskripsi: 'Asrama Putra Gedung A' },
  { namaBlok: 'Blok B (Putri)', jumlahKamar: 12, deskripsi: 'Asrama Putri Gedung B' },
  { namaBlok: 'Blok C (Putra Lanjutan)', jumlahKamar: 8 },
  { namaBlok: 'Blok D (Alumni)', jumlahKamar: 5, deskripsi: 'Khusus untuk Alumni yang berkunjung/menginap sementara' },
];

const defaultPesantrenProfileData: Omit<PesantrenProfileData, 'id' | keyof AppwriteDocument> = { 
  namaPesantren: "Pesantren Modern Al-Hikmah",
  alamatLengkap: "Jl. Pendidikan No. 123, Kota Santri, Kode Pos 12345",
  kotaKabupaten: "Kota Santri",
  nomorTelepon: "(021) 123-4567",
};
let pesantrenProfileDocumentId: string | null = null; 

interface ReceiptDataForPrint {
  santri: Santri;
  billDefinition: BillDefinition;
  paymentRecord: SantriPaymentRecord;
  pesantrenProfile: PesantrenProfileData;
  namaKelas?: string; 
}

type IqsamExamPayload = Omit<IqsamExam, 'id' | keyof AppwriteDocument>;
type IqsamScorePayload = Omit<IqsamScoreRecord, 'id' | keyof AppwriteDocument>;


const App: React.FC = () => {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [userList, setUserList] = useState<User[]>([]); 
  const [appwriteUser, setAppwriteUser] = useState<Models.User<Models.Preferences> | null>(null); 

  const [isLoadingSantri, setIsLoadingSantri] = useState(true); // Kept for specific loading if needed
  const [isLoadingUsers, setIsLoadingUsers] = useState(true); // Kept for specific loading if needed
  const [isSeedingData, setIsSeedingData] = useState(false);

  const [billDefinitions, setBillDefinitions] = useState<BillDefinition[]>([]);
  const [santriPaymentRecords, setSantriPaymentRecords] = useState<SantriPaymentRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [pesantrenProfileData, setPesantrenProfileData] = useState<PesantrenProfileData>(defaultPesantrenProfileData as PesantrenProfileData);
  const [leavePermitRecords, setLeavePermitRecords] = useState<LeavePermitRecord[]>([]);
  const [coretKttRecords, setCoretKttRecords] = useState<CoretKttRecord[]>([]);
  const [kelasRecords, setKelasRecords] = useState<KelasRecord[]>([]);
  const [blokRecords, setBlokRecords] = useState<BlokRecord[]>([]);
  const [iqsamExams, setIqsamExams] = useState<IqsamExam[]>([]);
  const [iqsamScoreRecords, setIqsamScoreRecords] = useState<IqsamScoreRecord[]>([]);
  const [tamrinExams, setTamrinExams] = useState<TamrinExam[]>([]);
  const [tamrinScoreRecords, setTamrinScoreRecords] = useState<TamrinScoreRecord[]>([]);
  
  const [isLoadingAppData, setIsLoadingAppData] = useState(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterKelasId, setFilterKelasId] = useState<string>(''); 
  const [filterBlokId, setFilterBlokId] = useState<string>('');   
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [currentSantri, setCurrentSantri] = useState<Santri | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [santriToDeleteId, setSantriToDeleteId] = useState<string | null>(null);
  
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState<boolean>(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState<User | null>(null);
  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState<boolean>(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null); 

  const [isBillDefinitionFormModalOpen, setIsBillDefinitionFormModalOpen] = useState<boolean>(false);
  const [currentBillDefinitionToEdit, setCurrentBillDefinitionToEdit] = useState<BillDefinition | null>(null);
  const [isDeleteBillDefinitionConfirmOpen, setIsDeleteBillDefinitionConfirmOpen] = useState<boolean>(false);
  const [billDefinitionToDeleteId, setBillDefinitionToDeleteId] = useState<string | null>(null);

  const [isPaymentConfirmationModalOpen, setIsPaymentConfirmationModalOpen] = useState<boolean>(false);
  const [currentPaymentConfirmationData, setCurrentPaymentConfirmationData] = useState<PaymentConfirmationData | null>(null);
  const [receiptDataForPrint, setReceiptDataForPrint] = useState<ReceiptDataForPrint | null>(null);
  const [rekapAbsensiPrintData, setRekapAbsensiPrintData] = useState<RekapAbsensiPrintData | null>(null); 
  const [santriDetailPrintData, setSantriDetailPrintData] = useState<SantriDetailPrintData | null>(null); 
  const [coretKttPrintData, setCoretKttPrintData] = useState<CoretKttPrintData | null>(null); 
  const [isAboutUsModalOpen, setIsAboutUsModalOpen] = useState<boolean>(false); 

  const [activeView, setActiveView] = useState<AppView>('Dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.ASATIDZ); // Default to a non-admin role
  const [isActualAdminSession, setIsActualAdminSession] = useState<boolean>(false); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  
  const [isKelasFormModalOpen, setIsKelasFormModalOpen] = useState<boolean>(false);
  const [currentKelasToEdit, setCurrentKelasToEdit] = useState<KelasRecord | null>(null);
  const [isDeleteKelasConfirmOpen, setIsDeleteKelasConfirmOpen] = useState<boolean>(false);
  const [kelasToDeleteId, setKelasToDeleteId] = useState<string | null>(null);

  const [isBlokFormModalOpen, setIsBlokFormModalOpen] = useState<boolean>(false);
  const [currentBlokToEdit, setCurrentBlokToEdit] = useState<BlokRecord | null>(null);
  const [isDeleteBlokConfirmOpen, setIsDeleteBlokConfirmOpen] = useState<boolean>(false);
  const [blokToDeleteId, setBlokToDeleteId] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const canManageUsers = useMemo(() => currentUserRole === UserRole.ADMINISTRATOR_UTAMA, [currentUserRole]);

  const fetchGenericCollection = useCallback(async <T extends AppwriteDocument & { id: string }>(collectionId: string, setData: React.Dispatch<React.SetStateAction<T[]>>, queryParams: string[] = []) => {
    try {
      const response = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, collectionId, queryParams);
      setData(response.documents.map(doc => mapDocumentToType<T>(doc)));
    } catch (error) {
      console.error(`Error fetching ${collectionId}:`, error);
      setData([]);
    }
  }, []);

  const fetchSantri = useCallback(() => fetchGenericCollection<Santri>(COLLECTION_ID_SANTRI, setSantriList), [fetchGenericCollection]);
  const fetchUsers = useCallback(() => fetchGenericCollection<User>(COLLECTION_ID_USER_PROFILES, setUserList), [fetchGenericCollection]);
  const fetchBillDefinitions = useCallback(() => fetchGenericCollection<BillDefinition>(COLLECTION_ID_BILL_DEFINITIONS, setBillDefinitions), [fetchGenericCollection]);
  const fetchSantriPaymentRecords = useCallback(() => fetchGenericCollection<SantriPaymentRecord>(COLLECTION_ID_SANTRI_PAYMENTS, setSantriPaymentRecords), [fetchGenericCollection]);
  const fetchAttendanceRecords = useCallback(() => fetchGenericCollection<AttendanceRecord>(COLLECTION_ID_ATTENDANCE_RECORDS, setAttendanceRecords), [fetchGenericCollection]);
  const fetchLeavePermitRecords = useCallback(() => fetchGenericCollection<LeavePermitRecord>(COLLECTION_ID_LEAVE_PERMITS, setLeavePermitRecords), [fetchGenericCollection]);
  const fetchCoretKttRecords = useCallback(() => fetchGenericCollection<CoretKttRecord>(COLLECTION_ID_CORET_KTT_RECORDS, setCoretKttRecords), [fetchGenericCollection]);
  const fetchIqsamExams = useCallback(() => fetchGenericCollection<IqsamExam>(COLLECTION_ID_IQSAM_EXAMS, setIqsamExams), [fetchGenericCollection]);
  const fetchIqsamScoreRecords = useCallback(() => fetchGenericCollection<IqsamScoreRecord>(COLLECTION_ID_IQSAM_SCORE_RECORDS, setIqsamScoreRecords), [fetchGenericCollection]);
  const fetchTamrinExams = useCallback(() => fetchGenericCollection<TamrinExam>(COLLECTION_ID_TAMRIN_EXAMS, setTamrinExams), [fetchGenericCollection]);
  const fetchTamrinScoreRecords = useCallback(() => fetchGenericCollection<TamrinScoreRecord>(COLLECTION_ID_TAMRIN_SCORE_RECORDS, setTamrinScoreRecords), [fetchGenericCollection]);

  const fetchKelasRecords = useCallback(async (isInitial = false) => {
    try {
      const response = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID_KELAS_RECORDS);
      if (response.documents.length > 0) {
        setKelasRecords(response.documents.map(doc => mapDocumentToType<KelasRecord>(doc)));
      } else if (isInitial && canManageUsers) {
        const seededRecords = [];
        for (const data of initialKelasRecordsData) {
          const newDoc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_KELAS_RECORDS, ID.unique(), data);
          seededRecords.push(mapDocumentToType<KelasRecord>(newDoc));
        }
        setKelasRecords(seededRecords);
      }
    } catch (error) { console.error("Error fetching/seeding kelas records:", error); setKelasRecords([]); }
  }, [canManageUsers]);

  const fetchBlokRecords = useCallback(async (isInitial = false) => {
    try {
      const response = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID_BLOK_RECORDS);
      if (response.documents.length > 0) {
        setBlokRecords(response.documents.map(doc => mapDocumentToType<BlokRecord>(doc)));
      } else if (isInitial && canManageUsers) {
        const seededRecords = [];
        for (const data of initialBlokRecordsData) {
          const newDoc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_BLOK_RECORDS, ID.unique(), data);
          seededRecords.push(mapDocumentToType<BlokRecord>(newDoc));
        }
        setBlokRecords(seededRecords);
      }
    } catch (error) { console.error("Error fetching/seeding blok records:", error); setBlokRecords([]); }
  }, [canManageUsers]);

  const fetchPesantrenProfile = useCallback(async (isInitial = false) => {
    try {
      const response = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID_PESANTREN_PROFILE);
      if (response.documents.length > 0) {
        const profile = mapDocumentToType<PesantrenProfileData>(response.documents[0]);
        pesantrenProfileDocumentId = profile.id; 
        setPesantrenProfileData(profile);
      } else if (isInitial && canManageUsers) {
        const newProfileDoc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_PESANTREN_PROFILE, ID.unique(), defaultPesantrenProfileData);
        pesantrenProfileDocumentId = newProfileDoc.$id;
        setPesantrenProfileData(mapDocumentToType<PesantrenProfileData>(newProfileDoc));
      }
    } catch (error) { console.error("Error fetching/seeding pesantren profile:", error); }
  }, [canManageUsers]);


  const checkUserSession = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      const currentUser = await appwriteAccount.get();
      setAppwriteUser(currentUser);
      setIsLoggedIn(true);
      
      const profileDocs = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID_USER_PROFILES, [
        Query.equal('appwriteUserId', currentUser.$id)
      ]);
      if (profileDocs.documents.length > 0) {
        const userProfile = mapDocumentToType<User>(profileDocs.documents[0]);
        setCurrentUserRole(userProfile.role);
        setIsActualAdminSession(userProfile.role === UserRole.ADMINISTRATOR_UTAMA);
      } else {
        setCurrentUserRole(UserRole.ASATIDZ); 
        setIsActualAdminSession(false);
        // Consider creating a default profile or redirecting to profile creation
      }
    } catch (error) {
      setAppwriteUser(null);
      setIsLoggedIn(false);
      setCurrentUserRole(UserRole.ASATIDZ);
      setIsActualAdminSession(false);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);
  
  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  useEffect(() => {
    const fetchAllInitialData = async () => {
      if (!isLoggedIn) {
        setIsLoadingAppData(false);
        return;
      }
      setIsLoadingAppData(true);
      try {
        await Promise.all([
          fetchSantri(), fetchUsers(), fetchBillDefinitions(), fetchSantriPaymentRecords(),
          fetchAttendanceRecords(), fetchPesantrenProfile(true), fetchLeavePermitRecords(),
          fetchCoretKttRecords(), fetchIqsamExams(), fetchIqsamScoreRecords(),
          fetchTamrinExams(), fetchTamrinScoreRecords(), fetchKelasRecords(true), fetchBlokRecords(true)
        ]);
      } catch (error) {
        console.error("Error fetching all app data:", error);
      } finally {
        setIsLoadingAppData(false);
      }
    };
    fetchAllInitialData();
  }, [isLoggedIn, fetchSantri, fetchUsers, fetchBillDefinitions, fetchSantriPaymentRecords, fetchAttendanceRecords, fetchPesantrenProfile, fetchLeavePermitRecords, fetchCoretKttRecords, fetchIqsamExams, fetchIqsamScoreRecords, fetchTamrinExams, fetchTamrinScoreRecords, fetchKelasRecords, fetchBlokRecords ]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await appwriteAccount.createEmailPasswordSession(authEmail, authPassword);
      await checkUserSession(); // Refetch user data and profile
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await appwriteAccount.deleteSession('current');
      setIsLoggedIn(false);
      setAppwriteUser(null);
      setCurrentUserRole(UserRole.ASATIDZ); // Reset role
      setIsActualAdminSession(false);
      // Clear all fetched data
      setSantriList([]); setUserList([]); setBillDefinitions([]); setSantriPaymentRecords([]);
      setAttendanceRecords([]); setPesantrenProfileData(defaultPesantrenProfileData as PesantrenProfileData); setLeavePermitRecords([]);
      setCoretKttRecords([]); setKelasRecords([]); setBlokRecords([]);
      setIqsamExams([]); setIqsamScoreRecords([]); setTamrinExams([]); setTamrinScoreRecords([]);
      setActiveView('Dashboard'); // Navigate to a default view or login screen
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSeedData = async () => { /* ... This might be deprecated or adapted if needed ... */ };
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const handleNavigation = (view: AppView) => { setActiveView(view); setSearchTerm(''); setFilterKelasId(''); setFilterBlokId(''); if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarOpen(false); };

  const handleAddSantriClick = () => { setCurrentSantri(null); setIsFormModalOpen(true); };
  const handleEditSantriClick = (santri: Santri) => { setCurrentSantri(santri); setIsFormModalOpen(true); };
  const handleDeleteSantriClick = (id: string) => { setSantriToDeleteId(id); setIsDeleteConfirmOpen(true); };

  const confirmDeleteSantri = async () => {
    if (!santriToDeleteId) return;
    try {
      const santriData = santriList.find(s => s.id === santriToDeleteId);
      if (santriData?.pasFotoFileId) {
        await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, santriData.pasFotoFileId);
      }
      await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_SANTRI, santriToDeleteId);
      await fetchSantri();
      setIsDeleteConfirmOpen(false);
      setSantriToDeleteId(null);
    } catch (error) { console.error("Error deleting santri:", error); alert("Gagal menghapus santri."); }
  };
  const handleSaveSantri = async (santriData: Omit<Santri, 'id' | keyof AppwriteDocument>, pasFotoFile?: File | null, docId?: string) => {
    try {
      let dataToSave = { ...santriData };
      if (pasFotoFile) {
        if (docId && currentSantri?.pasFotoFileId) { // If editing and old photo exists
          try { await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, currentSantri.pasFotoFileId); } catch (e) { console.warn("Failed to delete old photo, might not exist:", e); }
        }
        const fileUpload = await appwriteStorage.createFile(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, ID.unique(), pasFotoFile);
        dataToSave.pasFotoFileId = fileUpload.$id;
      } else if (docId && !dataToSave.pasFotoFileId && currentSantri?.pasFotoFileId) {
        // Photo removed without new one, delete old from storage
         try { await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, currentSantri.pasFotoFileId); } catch (e) { console.warn("Failed to delete old photo on removal:", e); }
         dataToSave.pasFotoFileId = undefined; // Ensure it's cleared
      }


      if (docId) {
        await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_SANTRI, docId, dataToSave);
      } else {
        await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_SANTRI, ID.unique(), dataToSave);
      }
      await fetchSantri();
      setIsFormModalOpen(false);
      setCurrentSantri(null);
    } catch (error) { console.error("Error saving santri:", error); alert("Gagal menyimpan data santri."); }
  };
  
  const activeSantriList = useMemo(() => santriList.filter(s => s.status === SantriStatus.AKTIF), [santriList]);
  
  const handleAddUserClick = () => { setCurrentUserToEdit(null); setIsUserFormModalOpen(true); };
  const handleEditUserClick = (user: User) => { setCurrentUserToEdit(user); setIsUserFormModalOpen(true); };
  const handleDeleteUserClick = (userId: string) => { setUserToDeleteId(userId); setIsDeleteUserConfirmOpen(true); };
  
  const confirmDeleteUser = async () => {
    if (!userToDeleteId) return;
    try {
      // Note: This deletes the profile document, not the Appwrite account.
      await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_USER_PROFILES, userToDeleteId);
      await fetchUsers();
      setIsDeleteUserConfirmOpen(false);
      setUserToDeleteId(null);
    } catch (error) { console.error("Error deleting user profile:", error); alert("Gagal menghapus profil pengguna."); }
  };

  const handleSaveUser = async (userData: Pick<User, 'username' | 'namaLengkap' | 'role'> & { password?: string }, docId?: string) => {
    if (!appwriteUser) { alert("Admin tidak login."); return; }
    try {
      const { password, ...profileData } = userData;
      if (docId) { // Editing profile
        await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_USER_PROFILES, docId, profileData);
        // Password/email change for Appwrite Account needs specific Appwrite Account API calls, not handled here.
      } else { // Creating new profile (and potentially new Appwrite Account)
        if (!password) { alert("Password dibutuhkan untuk pengguna baru."); return; }
        // Create Appwrite Account first
        const newAppwriteAccount = await appwriteAccount.create(ID.unique(), userData.username, password, userData.namaLengkap);
        // Then create profile document
        const completeProfileData = { ...profileData, appwriteUserId: newAppwriteAccount.$id };
        await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_USER_PROFILES, ID.unique(), completeProfileData);
      }
      await fetchUsers();
      setIsUserFormModalOpen(false);
      setCurrentUserToEdit(null);
    } catch (error: any) {
      console.error("Error saving user:", error);
      alert(`Gagal menyimpan pengguna: ${error.message || 'Error tidak diketahui'}`);
    }
  };
  
  const handleAddBillDefinitionClick = () => { setCurrentBillDefinitionToEdit(null); setIsBillDefinitionFormModalOpen(true); };
  const handleEditBillDefinitionClick = (billDef: BillDefinition) => { setCurrentBillDefinitionToEdit(billDef); setIsBillDefinitionFormModalOpen(true); };
  const handleDeleteBillDefinitionClick = (billDefId: string) => { setBillDefinitionToDeleteId(billDefId); setIsDeleteBillDefinitionConfirmOpen(true); };
  
  const confirmDeleteBillDefinition = async () => {
    if (!billDefinitionToDeleteId) return;
    try {
      // Also delete related santri_payments. Appwrite might need functions for cascading deletes or handle client-side.
      // For now, simple delete of bill definition.
      const paymentsToDelete = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ID_SANTRI_PAYMENTS, [Query.equal('billDefinitionId', billDefinitionToDeleteId)]);
      for (const payment of paymentsToDelete.documents) {
        await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_SANTRI_PAYMENTS, payment.$id);
      }
      await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_BILL_DEFINITIONS, billDefinitionToDeleteId);
      await fetchBillDefinitions();
      await fetchSantriPaymentRecords(); // Refresh payments
      setIsDeleteBillDefinitionConfirmOpen(false);
      setBillDefinitionToDeleteId(null);
    } catch (error) { console.error("Error deleting bill definition:", error); alert("Gagal menghapus jenis tagihan."); }
  };

  const handleSaveBillDefinition = async (billDefData: Omit<BillDefinition, 'id' | keyof AppwriteDocument>, docId?: string) => {
    try {
      if (docId) {
        await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_BILL_DEFINITIONS, docId, billDefData);
      } else {
        await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_BILL_DEFINITIONS, ID.unique(), billDefData);
      }
      await fetchBillDefinitions();
      setIsBillDefinitionFormModalOpen(false);
      setCurrentBillDefinitionToEdit(null);
    } catch (error) { console.error("Error saving bill definition:", error); alert("Gagal menyimpan jenis tagihan."); }
  };
  
  const handleOpenPaymentConfirmationModal = (data: PaymentConfirmationData) => { setCurrentPaymentConfirmationData(data); setIsPaymentConfirmationModalOpen(true); };
  const handleConfirmPayment = async ( santriId: string, billDefinitionId: string, billingPeriod: string, amountPaid: number, paymentMethod: PaymentMethod, notes?: string ) => { /* ... to be implemented ... */ };
  const handleSaveAttendance = async (newRecordsForDate: AttendanceRecord[]) => { /* ... to be implemented ... */ };
  const handleExportRekapAbsensiToPdf = ( rekapData: AttendanceSummary[], periodDescription: string, selectedKelas: string, generatedByUserName: string ) => { /* ... to be implemented ... */ };
  
  const handleSavePesantrenProfile = async (data: Omit<PesantrenProfileData, 'id' | keyof AppwriteDocument>) => {
    try {
      if (pesantrenProfileDocumentId) {
        await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_PESANTREN_PROFILE, pesantrenProfileDocumentId, data);
      } else { // Should not happen if seeding works, but as a fallback
        const newDoc = await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_PESANTREN_PROFILE, ID.unique(), data);
        pesantrenProfileDocumentId = newDoc.$id;
      }
      await fetchPesantrenProfile(); // Re-fetch
      alert("Profil Pesantren berhasil disimpan.");
    } catch (error) { console.error("Error saving pesantren profile:", error); alert("Gagal menyimpan profil pesantren.");}
  };

  const handleExportSantriDetailToPdf = async (santriToPrint: Santri): Promise<void> => { 
      let pasFotoUrlForPdf: string | undefined = undefined;
      if (santriToPrint.pasFotoFileId) {
          try {
              const urlObject = appwriteStorage.getFilePreview(APPWRITE_BUCKET_ID_SANTRI_PHOTOS, santriToPrint.pasFotoFileId);
              pasFotoUrlForPdf = urlObject.toString(); 
          } catch (error) { console.error("Error getting pasFoto for PDF:", error); }
      }
      const namaKelas = kelasRecords.find(k => k.id === santriToPrint.kelasid)?.namaKelas;
      const namaBlok = blokRecords.find(b => b.id === santriToPrint.blokid)?.namaBlok;
      setSantriDetailPrintData({ santri: santriToPrint, pesantrenProfile: pesantrenProfileData, printedByUserName: appwriteUser?.name || userRoleDisplayNames[currentUserRole], namaKelas, namaBlok, pasFotoUrlForPdf });
      setTimeout(() => window.print(), 500); // Allow state to update and content to render
  };

  const handleAddLeavePermit = async (permit: Omit<LeavePermitRecord, 'id' | 'recordedAt' | 'durationMinutes' | 'actualReturnDate' | 'actualReturnTime'>) => { /* ... to be implemented ... */ };
  const handleMarkSantriAsReturned = async (permitId: string, actualReturnDate: string, actualReturnTime?: string | null) => { /* ... to be implemented ... */ };
  const handleCoretKtt = async (santriId: string, dismissalDate: string, reason: string) => { /* ... to be implemented ... */ };
  const calculateDateDifferenceString = (startDateStr: string, endDateStr: string): string => { return "Calculated Difference"; };
  const handleExportCoretKttToPdf = (coretRecord: CoretKttRecord) => { /* ... to be implemented ... */ };

  const handleAddKelasClick = () => { setCurrentKelasToEdit(null); setIsKelasFormModalOpen(true); };
  const handleEditKelasClick = (kelas: KelasRecord) => { setCurrentKelasToEdit(kelas); setIsKelasFormModalOpen(true); };
  const handleDeleteKelasClick = (id: string) => { setKelasToDeleteId(id); setIsDeleteKelasConfirmOpen(true); };
  
  const confirmDeleteKelas = async () => {
    if (!kelasToDeleteId) return;
    try {
      // Check dependencies (santri using this kelas) - requires more complex logic or backend constraint
      await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_KELAS_RECORDS, kelasToDeleteId);
      await fetchKelasRecords();
      setIsDeleteKelasConfirmOpen(false);
      setKelasToDeleteId(null);
    } catch (error) { console.error("Error deleting kelas:", error); alert("Gagal menghapus kelas."); }
  };

  const handleSaveKelas = async (data: Omit<KelasRecord, 'id' | keyof AppwriteDocument>, docId?: string) => {
    try {
      if (docId) {
        await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_KELAS_RECORDS, docId, data);
      } else {
        await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_KELAS_RECORDS, ID.unique(), data);
      }
      await fetchKelasRecords();
      setIsKelasFormModalOpen(false);
      setCurrentKelasToEdit(null);
    } catch (error) { console.error("Error saving kelas:", error); alert("Gagal menyimpan kelas."); }
  };

  const handleAddBlokClick = () => { setCurrentBlokToEdit(null); setIsBlokFormModalOpen(true); };
  const handleEditBlokClick = (blok: BlokRecord) => { setCurrentBlokToEdit(blok); setIsBlokFormModalOpen(true); };
  const handleDeleteBlokClick = (id: string) => { setBlokToDeleteId(id); setIsDeleteBlokConfirmOpen(true); };

  const confirmDeleteBlok = async () => {
    if (!blokToDeleteId) return;
    try {
      await appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_BLOK_RECORDS, blokToDeleteId);
      await fetchBlokRecords();
      setIsDeleteBlokConfirmOpen(false);
      setBlokToDeleteId(null);
    } catch (error) { console.error("Error deleting blok:", error); alert("Gagal menghapus blok."); }
  };

  const handleSaveBlok = async (data: Omit<BlokRecord, 'id' | keyof AppwriteDocument>, docId?: string) => {
    try {
      if (docId) {
        await appwriteDatabases.updateDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_BLOK_RECORDS, docId, data);
      } else {
        await appwriteDatabases.createDocument(APPWRITE_DATABASE_ID, COLLECTION_ID_BLOK_RECORDS, ID.unique(), data);
      }
      await fetchBlokRecords();
      setIsBlokFormModalOpen(false);
      setCurrentBlokToEdit(null);
    } catch (error) { console.error("Error saving blok:", error); alert("Gagal menyimpan blok."); }
  };

  const handleSaveIqsamExam = (exam: IqsamExamPayload, existingExamId?: string): string => { 
    console.log("Placeholder: handleSaveIqsamExam", exam, existingExamId);
    // This function should ideally be async and interact with Appwrite
    // For now, just returning a new unique ID for non-existing exams
    // Or the existingExamId if provided (though update logic isn't here)
    const newId = existingExamId || ID.unique();
    // Simulate adding/updating to local state if not doing full Appwrite integration yet
    // This is a simplified version; real implementation would involve API calls and state updates
    if (existingExamId) {
        setIqsamExams(prev => prev.map(e => e.id === existingExamId ? { ...e, ...exam, id: existingExamId, $id: existingExamId } as IqsamExam : e));
    } else {
        // For a new exam, we'd need to create a full IqsamExam object with Appwrite fields
        // This part is tricky without actually calling Appwrite or having a more robust mock
        // For now, let's just add it with a temporary structure
        const tempAppwriteDoc: AppwriteDocument = { $id: newId, $collectionId: COLLECTION_ID_IQSAM_EXAMS, $databaseId: APPWRITE_DATABASE_ID, $createdAt: new Date().toISOString(), $updatedAt: new Date().toISOString(), $permissions: [] };
        setIqsamExams(prev => [...prev, { ...tempAppwriteDoc, ...exam, id: newId } as IqsamExam]);
    }
    return newId;
   };
  const handleSaveIqsamScoreRecords = async (records: IqsamScorePayload[]) => { 
    console.log("Placeholder: handleSaveIqsamScoreRecords", records);
    // Simulate saving and refetching
    const updatedScores = records.map(rec => {
        const existing = iqsamScoreRecords.find(sr => sr.santriId === rec.santriId && sr.iqsamExamId === rec.iqsamExamId);
        const appwriteDocPart: AppwriteDocument = existing 
            ? { $id: existing.id, $collectionId: existing.$collectionId, $databaseId: existing.$databaseId, $createdAt: existing.$createdAt, $updatedAt: new Date().toISOString(), $permissions: existing.$permissions }
            : { $id: ID.unique(), $collectionId: COLLECTION_ID_IQSAM_SCORE_RECORDS, $databaseId: APPWRITE_DATABASE_ID, $createdAt: new Date().toISOString(), $updatedAt: new Date().toISOString(), $permissions: [] };
        
        return { ...appwriteDocPart, ...rec, id: appwriteDocPart.$id } as IqsamScoreRecord;
    });

    setIqsamScoreRecords(prev => {
        const newScores = [...prev];
        updatedScores.forEach(us => {
            const index = newScores.findIndex(ns => ns.id === us.id);
            if (index > -1) newScores[index] = us;
            else newScores.push(us);
        });
        return newScores;
    });
  };
  const handleDeleteIqsamExamAndScores = async (examId: string) => { 
    console.log("Placeholder: handleDeleteIqsamExamAndScores", examId);
    setIqsamExams(prev => prev.filter(ex => ex.id !== examId));
    setIqsamScoreRecords(prev => prev.filter(sr => sr.iqsamExamId !== examId));
  };
  const handleSaveTamrinExam = (exam: TamrinExamPayload, existingExamId?: string): string => { 
    console.log("Placeholder: handleSaveTamrinExam", exam, existingExamId);
    const newId = existingExamId || ID.unique();
    if (existingExamId) {
        setTamrinExams(prev => prev.map(e => e.id === existingExamId ? { ...e, ...exam, id: existingExamId, $id: existingExamId } as TamrinExam : e));
    } else {
        const tempAppwriteDoc: AppwriteDocument = { $id: newId, $collectionId: COLLECTION_ID_TAMRIN_EXAMS, $databaseId: APPWRITE_DATABASE_ID, $createdAt: new Date().toISOString(), $updatedAt: new Date().toISOString(), $permissions: [] };
        setTamrinExams(prev => [...prev, { ...tempAppwriteDoc, ...exam, id: newId } as TamrinExam]);
    }
    return newId;
  };
  const handleSaveTamrinScoreRecords = async (records: TamrinScorePayload[]) => { 
    console.log("Placeholder: handleSaveTamrinScoreRecords", records);
     const updatedScores = records.map(rec => { // rec is TamrinScorePayload
        const existing = tamrinScoreRecords.find(sr => sr.santriId === rec.santriId && sr.tamrinExamId === rec.tamrinExamId);
        const appwriteDocPart: AppwriteDocument = existing 
            ? { $id: existing.id, $collectionId: existing.$collectionId, $databaseId: existing.$databaseId, $createdAt: existing.$createdAt, $updatedAt: new Date().toISOString(), $permissions: existing.$permissions }
            : { $id: ID.unique(), $collectionId: COLLECTION_ID_TAMRIN_SCORE_RECORDS, $databaseId: APPWRITE_DATABASE_ID, $createdAt: new Date().toISOString(), $updatedAt: new Date().toISOString(), $permissions: [] };
        
        return { ...appwriteDocPart, ...rec, id: appwriteDocPart.$id } as TamrinScoreRecord;
    });

    setTamrinScoreRecords(prev => {
        const newScores = [...prev];
        updatedScores.forEach(us => {
            const index = newScores.findIndex(ns => ns.id === us.id);
            if (index > -1) newScores[index] = us;
            else newScores.push(us);
        });
        return newScores;
    });
  };
  const handleDeleteTamrinExamAndScores = async (examId: string) => { 
    console.log("Placeholder: handleDeleteTamrinExamAndScores", examId);
    setTamrinExams(prev => prev.filter(ex => ex.id !== examId));
    setTamrinScoreRecords(prev => prev.filter(sr => sr.tamrinExamId !== examId));
  };

  const filteredSantriList = useCallback((): Santri[] => { 
      let list = santriList.filter(s => s.status === SantriStatus.AKTIF);
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        list = list.filter(s => 
          s.namalengkap.toLowerCase().includes(lowerSearchTerm) ||
          s.namawali.toLowerCase().includes(lowerSearchTerm) ||
          s.daerahasal.toLowerCase().includes(lowerSearchTerm) ||
          s.alamatlengkap.toLowerCase().includes(lowerSearchTerm) ||
          s.nomorktt?.toLowerCase().includes(lowerSearchTerm) ||
          s.status.toLowerCase().includes(lowerSearchTerm)
        );
      }
      if (filterKelasId) list = list.filter(s => s.kelasid === filterKelasId);
      if (filterBlokId) list = list.filter(s => s.blokid === filterBlokId);
      return list.sort((a, b) => a.namalengkap.localeCompare(b.namalengkap));
  }, [santriList, searchTerm, filterKelasId, filterBlokId]);
  
  const alumniList = useCallback((): Santri[] => { 
    let list = santriList.filter(s => s.status === SantriStatus.ALUMNI);
    // Apply similar filters if needed for alumni view
    return list.sort((a, b) => a.namalengkap.localeCompare(b.namalengkap));
  }, [santriList]); 
  
  const munjizList = useMemo((): Santri[] => { return []; }, []); // Placeholder
  const filteredMunjizList = useCallback((): Santri[] => { return []; }, []); // Placeholder

  const renderView = () => {
    if (isLoadingAppData && isLoggedIn) {
        return <PlaceholderView title="Memuat Data" message="Sedang mengambil data dari server..." />;
    }
    
    const accessibleViews = menuAccessConfig[currentUserRole] || [];
    if (!accessibleViews.includes(activeView) && activeView !== 'Dashboard') { // Dashboard always accessible
      return <PlaceholderView title="Akses Ditolak" message="Anda tidak memiliki izin untuk mengakses halaman ini." />;
    }

    switch (activeView) {
      case 'Dashboard': return <DashboardView santriList={santriList} />;
      case 'DataSantri': return (
        <>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <button onClick={handleAddSantriClick} className="flex items-center gap-2 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-neutral text-sm whitespace-nowrap">
              <PlusIcon className="w-5 h-5" /> Tambah Santri Baru
            </button>
          </div>
          <SantriList santriList={filteredSantriList()} onEdit={handleEditSantriClick} onDelete={handleDeleteSantriClick} onExportPdf={handleExportSantriDetailToPdf} kelasRecords={kelasRecords} blokRecords={blokRecords} />
        </>
      );
      case 'DataAlumni': return <SantriList santriList={alumniList()} onEdit={handleEditSantriClick} onDelete={handleDeleteSantriClick} onExportPdf={handleExportSantriDetailToPdf} kelasRecords={kelasRecords} blokRecords={blokRecords} />;
      case 'DataMunjiz': return <PlaceholderView title={pageTitles.DataMunjiz} />;
      case 'UserManagement': return <UserManagementView users={userList} onAddUser={handleAddUserClick} onEditUser={handleEditUserClick} onDeleteUser={handleDeleteUserClick} />;
      case 'FinancialManagement': return <FinancialManagementView billDefinitions={billDefinitions} onAddBillDefinition={handleAddBillDefinitionClick} onEditBillDefinition={handleEditBillDefinitionClick} onDeleteBillDefinition={handleDeleteBillDefinitionClick} currentUserRole={currentUserRole} />;
      case 'SantriPaymentManagement': return <SantriPaymentManagementView santriList={activeSantriList} billDefinitions={billDefinitions} paymentRecords={santriPaymentRecords} onOpenPaymentConfirmationModal={handleOpenPaymentConfirmationModal} currentUserRole={currentUserRole} pesantrenProfile={pesantrenProfileData} kelasRecords={kelasRecords} />;
      case 'Absensi': return <AbsensiView activeSantriList={activeSantriList} allAttendanceRecords={attendanceRecords} onSaveAttendance={handleSaveAttendance} currentUserRole={currentUserRole} kelasRecords={kelasRecords} />;
      case 'RekapAbsensi': return <RekapAbsensiView activeSantriList={activeSantriList} allAttendanceRecords={attendanceRecords} onPrintRekap={handleExportRekapAbsensiToPdf} currentUserRole={currentUserRole} kelasRecords={kelasRecords} />;
      case 'PesantrenProfile': return <PesantrenProfileView pesantrenProfile={pesantrenProfileData} onSavePesantrenProfile={handleSavePesantrenProfile} />;
      case 'PerizinanSantri': return <PerizinanSantriView activeSantriList={activeSantriList} leavePermitRecords={leavePermitRecords} onAddLeavePermit={handleAddLeavePermit} onMarkSantriAsReturned={handleMarkSantriAsReturned} currentUserRole={currentUserRole} kelasRecords={kelasRecords} />;
      case 'CoretKtt': return <CoretKttView activeSantriList={activeSantriList} coretKttRecords={coretKttRecords} onCoretKtt={handleCoretKtt} currentUserRole={currentUserRole} onExportPdf={handleExportCoretKttToPdf} kelasRecords={kelasRecords} />;
      case 'KelasManagement': return <KelasManagementView kelasRecords={kelasRecords} onAddKelas={handleAddKelasClick} onEditKelas={handleEditKelasClick} onDeleteKelas={handleDeleteKelasClick} />;
      case 'BlokManagement': return <BlokManagementView blokRecords={blokRecords} activeSantriList={activeSantriList} onAddBlok={handleAddBlokClick} onEditBlok={handleEditBlokClick} onDeleteBlok={handleDeleteBlokClick} />;
      case 'KetuaBlokList': return <KetuaBlokListView blokRecords={blokRecords} santriList={santriList} kelasRecords={kelasRecords} />;
      case 'ManajemenUjianIqsam': return <ManajemenUjianIqsamView activeSantriList={activeSantriList} kelasRecords={kelasRecords} iqsamExams={iqsamExams} iqsamScoreRecords={iqsamScoreRecords} onSaveExam={handleSaveIqsamExam} onSaveScores={handleSaveIqsamScoreRecords} onDeleteExamAndScores={handleDeleteIqsamExamAndScores} currentUserRole={currentUserRole} />;
      case 'ManajemenUjianTamrin': return <ManajemenUjianTamrinView activeSantriList={activeSantriList} kelasRecords={kelasRecords} asatidzList={userList.filter(u => u.role === UserRole.ASATIDZ)} tamrinExams={tamrinExams} tamrinScoreRecords={tamrinScoreRecords} onSaveExam={handleSaveTamrinExam} onSaveScores={handleSaveTamrinScoreRecords} onDeleteExamAndScores={handleDeleteTamrinExamAndScores} currentUserRole={currentUserRole} />;
      default: return <PlaceholderView title={activeView} message="Halaman ini belum diimplementasikan sepenuhnya dengan Appwrite." />;
    }
  };
  
  const currentPageTitle = pageTitles[activeView] || "Ma'had Suite";

  if (isAuthenticating) {
    return (
        <div className="flex items-center justify-center h-screen bg-neutral">
            <div className="p-8 bg-base-100 rounded-lg shadow-xl text-center">
                <DatabaseIcon className="w-16 h-16 text-secondary mx-auto mb-4 animate-pulse" />
                <h1 className="text-2xl font-bold text-neutral-content">Memeriksa Sesi...</h1>
            </div>
        </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral">
        <form onSubmit={handleLogin} className="p-8 bg-base-100 rounded-lg shadow-xl w-full max-w-sm space-y-6">
          <h1 className="text-3xl font-bold text-center text-primary">Ma’had Suite Login</h1>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-content">Email</label>
            <input type="email" id="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="password_login" className="block text-sm font-medium text-neutral-content">Password</label>
            <input type="password" id="password_login" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"/>
          </div>
          {authError && <p className="text-sm text-red-600 text-center">{authError}</p>}
          <button type="submit" disabled={isAuthenticating} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-secondary-content bg-secondary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50">
            {isAuthenticating ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral overflow-hidden">
      <Navbar 
        isSidebarOpen={isSidebarOpen} 
        activeView={activeView} 
        onNavigate={handleNavigation} 
        onLogout={handleLogout} 
        currentUserRole={currentUserRole}
        setCurrentUserRole={setCurrentUserRole}
        isActualAdminSession={isActualAdminSession}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <header className="sticky top-0 z-30 bg-primary shadow-md print:hidden">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button type="button" className="-m-2.5 p-2.5 text-primary-content lg:hidden flex-shrink-0" onClick={toggleSidebar} aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}>
              {isSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
            <h1 className="flex-1 min-w-0 truncate text-2xl sm:text-3xl font-bold text-primary-content">
              {currentPageTitle}
            </h1>
            <button onClick={() => setIsAboutUsModalOpen(true)} className="text-xs text-primary-content/70 hover:text-primary-content hover:underline transition-colors">
              Tentang Aplikasi
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-full mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={currentSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}>
        <SantriForm onSubmit={handleSaveSantri} initialData={currentSantri} onClose={() => setIsFormModalOpen(false)} kelasRecords={kelasRecords} blokRecords={blokRecords}/>
      </Modal>
      <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDeleteSantri} title="Konfirmasi Hapus Santri" message={`Apakah Anda yakin ingin menghapus data santri ${santriList.find(s => s.id === santriToDeleteId)?.namalengkap || ''}? Tindakan ini tidak dapat diurungkan.`} />
      
      <UserFormModal isOpen={isUserFormModalOpen} onClose={() => setIsUserFormModalOpen(false)} onSubmit={handleSaveUser} initialData={currentUserToEdit} />
      <ConfirmationModal isOpen={isDeleteUserConfirmOpen} onClose={() => setIsDeleteUserConfirmOpen(false)} onConfirm={confirmDeleteUser} title="Konfirmasi Hapus Pengguna" message={`Apakah Anda yakin ingin menghapus profil pengguna ${userList.find(u => u.id === userToDeleteId)?.username || ''}? Akun Appwrite pengguna tidak akan terhapus.`} />
      
      <BillDefinitionFormModal isOpen={isBillDefinitionFormModalOpen} onClose={() => setIsBillDefinitionFormModalOpen(false)} onSubmit={handleSaveBillDefinition} initialData={currentBillDefinitionToEdit} />
      <ConfirmationModal isOpen={isDeleteBillDefinitionConfirmOpen} onClose={() => setIsDeleteBillDefinitionConfirmOpen(false)} onConfirm={confirmDeleteBillDefinition} title="Konfirmasi Hapus Jenis Tagihan" message={`Apakah Anda yakin ingin menghapus jenis tagihan ${billDefinitions.find(b => b.id === billDefinitionToDeleteId)?.namaTagihan || ''}? Semua data pembayaran terkait juga akan terhapus.`} />
      {currentPaymentConfirmationData && ( <SantriPaymentConfirmationModal isOpen={isPaymentConfirmationModalOpen} onClose={() => setIsPaymentConfirmationModalOpen(false)} paymentData={currentPaymentConfirmationData} onConfirmPayment={handleConfirmPayment} /> )}
       {receiptDataForPrint && ( <div className="print-section hidden"> <PaymentReceipt santri={receiptDataForPrint.santri} billDefinition={receiptDataForPrint.billDefinition} paymentRecord={receiptDataForPrint.paymentRecord} pesantrenProfile={pesantrenProfileData} namaKelas={receiptDataForPrint.namaKelas} /> </div> )}
      {rekapAbsensiPrintData && ( <div className="print-section hidden"> <RekapAbsensiPrintout {...rekapAbsensiPrintData} /> </div> )}
      {santriDetailPrintData && ( <div className="print-section hidden"> <SantriDetailPrintout {...santriDetailPrintData} /> </div> )}
      {coretKttPrintData && ( <div className="print-section hidden"> <CoretKttPrintout {...coretKttPrintData} /> </div> )}
      <AboutUsModal isOpen={isAboutUsModalOpen} onClose={() => setIsAboutUsModalOpen(false)} />
      <KelasFormModal isOpen={isKelasFormModalOpen} onClose={() => setIsKelasFormModalOpen(false)} onSubmit={handleSaveKelas} initialData={currentKelasToEdit} />
      <ConfirmationModal isOpen={isDeleteKelasConfirmOpen} onClose={() => setIsDeleteKelasConfirmOpen(false)} onConfirm={confirmDeleteKelas} title="Konfirmasi Hapus Kelas" message={`Apakah Anda yakin ingin menghapus kelas ${kelasRecords.find(k => k.id === kelasToDeleteId)?.namaKelas || ''}?`} />
      <BlokFormModal isOpen={isBlokFormModalOpen} onClose={() => setIsBlokFormModalOpen(false)} onSubmit={handleSaveBlok} initialData={currentBlokToEdit} activeSantriList={activeSantriList} />
      <ConfirmationModal isOpen={isDeleteBlokConfirmOpen} onClose={() => setIsDeleteBlokConfirmOpen(false)} onConfirm={confirmDeleteBlok} title="Konfirmasi Hapus Blok" message={`Apakah Anda yakin ingin menghapus blok ${blokRecords.find(b => b.id === blokToDeleteId)?.namaBlok || ''}?`} />
    </div>
  );
};

export default App;
