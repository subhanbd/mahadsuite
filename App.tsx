
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { getDummySantriData } from './services/dummyData';
import { 
  Santri, AppView, SantriStatus, JenisKelamin, UserRole, userRoleDisplayNames, menuAccessConfig, 
  User, BillDefinition, SantriPaymentRecord, PaymentStatus, PaymentMethod, PaymentConfirmationData,
  AttendanceRecord, AttendanceSummary, RekapAbsensiPrintData, RekapFilterType, PesantrenProfileData,
  SantriDetailPrintData, LeavePermitRecord, LeaveType, LeavePermitStatus, CoretKttRecord,
  CoretKttPrintData, SantriDetailForCoretPrint, 
  KelasRecord, BlokRecord, 
  IqsamExam, IqsamScoreRecord, TamrinExam, TamrinScoreRecord, IqsamPeriodeRefactored, AttendanceStatus as UjianAttendanceStatus,
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

// Global type for html2pdf
declare global {
  interface Window {
    html2pdf: any; 
  }
}

const pageTitles: Record<AppView, string> = {
  Dashboard: 'Dashboard Utama',
  DataSantri: 'Manajemen Data Santri Aktif',
  DataAlumni: 'Manajemen Data Alumni',
  DataMunjiz: 'Data Santri Munjiz',
  UserManagement: 'Manajemen Pengguna Sistem',
  FinancialManagement: 'Manajemen Jenis Tagihan Keuangan',
  SantriPaymentManagement: 'Manajemen Pembayaran Santri',
  Absensi: 'Input Absensi Santri',
  RekapAbsensi: 'Rekapitulasi Absensi Santri',
  PesantrenProfile: 'Profil Pesantren',
  PerizinanSantri: 'Manajemen Perizinan Santri',
  CoretKtt: 'Pencoretan Kartu Tanda Santri (KTT)',
  KelasManagement: 'Manajemen Kelas Halaqah',
  BlokManagement: 'Manajemen Blok Asrama',
  KetuaBlokList: 'Daftar Ketua Blok & Statistik',
  ManajemenUjianIqsam: 'Manajemen Ujian Iqsam',
  ManajemenUjianTamrin: 'Manajemen Ujian Tamrin',
};
const initialKelasRecordsData: Omit<KelasRecord, 'id' | 'created_at' | 'updated_at'>[] = [ /* ... (Keep initial data as is) ... */ ];
const initialBlokRecordsData: Omit<BlokRecord, 'id' | 'created_at' | 'updated_at'>[] = [ /* ... (Keep initial data as is) ... */ ];
const defaultPesantrenProfileData: Omit<PesantrenProfileData, 'id' | 'created_at' | 'updated_at'> = { 
  namaPesantren: 'Nama Pesantren Anda',
  alamatLengkap: 'Alamat Lengkap Pesantren Anda',
  kotaKabupaten: 'Kota/Kabupaten Pesantren',
  nomorTelepon: 'Nomor Telepon Pesantren'
};

interface ReceiptDataForPrint {
  santri: Santri;
  billDefinition: BillDefinition;
  paymentRecord: SantriPaymentRecord;
  pesantrenProfile: PesantrenProfileData;
  namaKelas?: string; 
}

type IqsamExamPayload = Omit<IqsamExam, 'id' | 'created_at' | 'updated_at'>;
type IqsamScorePayload = Omit<IqsamScoreRecord, 'id' | 'created_at' | 'updated_at'>;

const App: React.FC = () => {
  // State variables (most can remain, some might need type adjustments for Supabase)
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [userList, setUserList] = useState<User[]>([]); 
  const [supabaseAuthUser, setSupabaseAuthUser] = useState<SupabaseUser | null>(null);

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

  // UI State (can remain largely the same)
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
  
  const [santriDetailPrintData, setSantriDetailPrintData] = useState<SantriDetailPrintData | null>(null);
  const [isAboutUsModalOpen, setIsAboutUsModalOpen] = useState<boolean>(false);


  // ... (other UI state variables remain the same) ...
  const [activeView, setActiveView] = useState<AppView>('Dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.ASATIDZ); 
  const [isActualAdminSession, setIsActualAdminSession] = useState<boolean>(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true); 

  const canManageUsers = useMemo(() => currentUserRole === UserRole.ADMINISTRATOR_UTAMA, [currentUserRole]);

  // --- Supabase Fetch Functions ---
  const fetchGenericTable = useCallback(async <T extends { id: string }>(tableName: string, setData: React.Dispatch<React.SetStateAction<T[]>>) => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      setData([]);
      setAuthError(`Gagal memuat data ${tableName}: ${error.message}`);
    } else {
      setData(data as T[]);
    }
  }, []);

  const fetchSantri = useCallback(() => fetchGenericTable<Santri>('santri', setSantriList), [fetchGenericTable]);
  const fetchUsers = useCallback(() => fetchGenericTable<User>('user_profiles', setUserList), [fetchGenericTable]);
  const fetchBillDefinitions = useCallback(() => fetchGenericTable<BillDefinition>('bill_definitions', setBillDefinitions), [fetchGenericTable]);
  // ... (similar fetch functions for other tables) ...
  const fetchSantriPaymentRecords = useCallback(() => fetchGenericTable<SantriPaymentRecord>('santri_payments', setSantriPaymentRecords), [fetchGenericTable]);
  const fetchAttendanceRecords = useCallback(() => fetchGenericTable<AttendanceRecord>('attendance_records', setAttendanceRecords), [fetchGenericTable]);
  const fetchLeavePermitRecords = useCallback(() => fetchGenericTable<LeavePermitRecord>('leave_permits', setLeavePermitRecords), [fetchGenericTable]);
  const fetchCoretKttRecords = useCallback(() => fetchGenericTable<CoretKttRecord>('coret_ktt_records', setCoretKttRecords), [fetchGenericTable]);
  const fetchIqsamExams = useCallback(() => fetchGenericTable<IqsamExam>('iqsam_exams', setIqsamExams), [fetchGenericTable]);
  const fetchIqsamScoreRecords = useCallback(() => fetchGenericTable<IqsamScoreRecord>('iqsam_score_records', setIqsamScoreRecords), [fetchGenericTable]);
  const fetchTamrinExams = useCallback(() => fetchGenericTable<TamrinExam>('tamrin_exams', setTamrinExams), [fetchGenericTable]);
  const fetchTamrinScoreRecords = useCallback(() => fetchGenericTable<TamrinScoreRecord>('tamrin_score_records', setTamrinScoreRecords), [fetchGenericTable]);


  const fetchKelasRecords = useCallback(async (isInitial = false) => {
    const { data, error } = await supabase.from('kelas_records').select('*');
    if (error) console.error("Error fetching kelas_records:", error);
    else if (data && data.length > 0) setKelasRecords(data as KelasRecord[]);
    else if (isInitial && canManageUsers) {
      const { data: seededData, error: seedError } = await supabase.from('kelas_records').insert(initialKelasRecordsData.map(k => ({...k, id: crypto.randomUUID()}))).select();
      if (seedError) console.error("Error seeding kelas_records:", seedError);
      else if (seededData) setKelasRecords(seededData as KelasRecord[]);
    }
  }, [canManageUsers]);

  const fetchBlokRecords = useCallback(async (isInitial = false) => {
    const { data, error } = await supabase.from('blok_records').select('*');
    if (error) console.error("Error fetching blok_records:", error);
    else if (data && data.length > 0) setBlokRecords(data as BlokRecord[]);
    else if (isInitial && canManageUsers) {
      const { data: seededData, error: seedError } = await supabase.from('blok_records').insert(initialBlokRecordsData.map(b => ({...b, id: crypto.randomUUID()}))).select();
      if (seedError) console.error("Error seeding blok_records:", seedError);
      else if (seededData) setBlokRecords(seededData as BlokRecord[]);
    }
  }, [canManageUsers]);
  
  const fetchPesantrenProfile = useCallback(async (isInitial = false) => {
    const { data, error } = await supabase.from('pesantren_profile').select('*').limit(1);
    if (error) console.error("Error fetching pesantren_profile:", error);
    else if (data && data.length > 0) setPesantrenProfileData(data[0] as PesantrenProfileData);
    else if (isInitial && canManageUsers) {
        const { data: newProfile, error: insertError } = await supabase.from('pesantren_profile').insert({...defaultPesantrenProfileData, id: crypto.randomUUID()}).select().single();
        if (insertError) console.error("Error seeding pesantren_profile:", insertError);
        else if (newProfile) setPesantrenProfileData(newProfile as PesantrenProfileData);
    }
  }, [canManageUsers]);

  // --- Supabase Auth ---
  useEffect(() => {
    const checkSession = async () => {
      setIsAuthenticating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupabaseAuthUser(session.user);
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError || !userProfile) {
          console.error('Error fetching user profile or profile not found:', profileError);
          setCurrentUserRole(UserRole.ASATIDZ); 
          setIsActualAdminSession(false);
          setAuthError("Profil pengguna tidak ditemukan. Silakan hubungi Admin.");
          setIsLoggedIn(true);
        } else {
          setCurrentUserRole(userProfile.role as UserRole);
          setIsActualAdminSession(userProfile.role === UserRole.ADMINISTRATOR_UTAMA);
          setIsLoggedIn(true);
          setAuthError(null); 
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUserRole(UserRole.ASATIDZ);
        setIsActualAdminSession(false);
      }
      setIsAuthenticating(false);
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticating(true);
      if (session?.user) {
        setSupabaseAuthUser(session.user);
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError || !userProfile) {
          console.error('Error fetching user profile or profile not found on auth change:', profileError);
          setCurrentUserRole(UserRole.ASATIDZ);
          setIsActualAdminSession(false);
          setAuthError("Sesi aktif, tetapi profil pengguna tidak ditemukan.");
          setIsLoggedIn(true); 
        } else {
          setCurrentUserRole(userProfile.role as UserRole);
          setIsActualAdminSession(userProfile.role === UserRole.ADMINISTRATOR_UTAMA);
          setIsLoggedIn(true);
          setAuthError(null);
        }
      } else {
        setIsLoggedIn(false);
        setSupabaseAuthUser(null);
        setCurrentUserRole(UserRole.ASATIDZ);
        setIsActualAdminSession(false);
      }
      setIsAuthenticating(false);
    });
    return () => { authListener?.subscription.unsubscribe(); };
  }, []);

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
        console.error("Error fetching all app data with Supabase:", error);
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
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) {
      setAuthError(error.message);
      console.error("Login failed:", error);
    }
    setIsAuthenticating(false); 
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout failed:", error);
    else {
      setActiveView('Dashboard'); 
      setAuthEmail('');
      setAuthPassword('');
      setAuthError(null);
    }
  };
  
  // --- Supabase CRUD Santri ---
  const handleSaveSantri = async (santriData: Omit<Santri, 'id' | 'created_at' | 'updated_at'>, pasFotoFile?: File | null, docId?: string) => {
    try {
      let finalSantriData = { ...santriData };
      if (pasFotoFile) {
        if (docId && currentSantri?.pasfotourl) { 
          const oldPath = new URL(currentSantri.pasfotourl).pathname.split('/santri_photos/')[1];
          if (oldPath) await supabase.storage.from('santri_photos').remove([oldPath]);
        }
        const filePath = `${supabaseAuthUser?.id || 'public'}/${Date.now()}_${pasFotoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('santri_photos').upload(filePath, pasFotoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('santri_photos').getPublicUrl(uploadData!.path);
        finalSantriData.pasfotourl = urlData.publicUrl;
      } else if (docId && !finalSantriData.pasfotourl && currentSantri?.pasfotourl) { 
         const oldPath = new URL(currentSantri.pasfotourl).pathname.split('/santri_photos/')[1];
         if (oldPath) await supabase.storage.from('santri_photos').remove([oldPath]);
         finalSantriData.pasfotourl = undefined;
      }

      if (docId) { 
        const { error } = await supabase.from('santri').update(finalSantriData).eq('id', docId);
        if (error) throw error;
      } else { 
        const { error } = await supabase.from('santri').insert({ ...finalSantriData, id: crypto.randomUUID() });
        if (error) throw error;
      }
      await fetchSantri();
      setIsFormModalOpen(false);
      setCurrentSantri(null);
    } catch (error: any) {
      console.error("Error saving santri with Supabase:", error);
      alert(`Gagal menyimpan data santri: ${error.message}`);
    }
  };

  const confirmDeleteSantri = async () => {
    if (!santriToDeleteId) return;
    try {
      const santriData = santriList.find(s => s.id === santriToDeleteId);
      if (santriData?.pasfotourl) {
        const path = new URL(santriData.pasfotourl).pathname.split('/santri_photos/')[1];
        if (path) await supabase.storage.from('santri_photos').remove([path]);
      }
      const { error } = await supabase.from('santri').delete().eq('id', santriToDeleteId);
      if (error) throw error;
      await fetchSantri();
      setIsDeleteConfirmOpen(false);
      setSantriToDeleteId(null);
    } catch (error: any) {
      console.error("Error deleting santri with Supabase:", error);
      alert(`Gagal menghapus santri: ${error.message}`);
    }
  };

  const handleAddSantriClick = () => { setCurrentSantri(null); setIsFormModalOpen(true); };
  const handleEditSantriClick = (santri: Santri) => { setCurrentSantri(santri); setIsFormModalOpen(true); };
  const handleDeleteSantriClick = (id: string) => { setSantriToDeleteId(id); setIsDeleteConfirmOpen(true); };
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const handleNavigation = (view: AppView) => { setActiveView(view); setSearchTerm(''); setFilterKelasId(''); setFilterBlokId(''); if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarOpen(false); };
  
  const activeSantriList = useMemo(() => santriList.filter(s => s.status === SantriStatus.AKTIF), [santriList]);
  
  // --- Supabase User Profile Management ---
  const handleAddUserClick = () => { setCurrentUserToEdit(null); setIsUserFormModalOpen(true); };
  const handleEditUserClick = (user: User) => { setCurrentUserToEdit(user); setIsUserFormModalOpen(true); };
  const handleDeleteUserClick = (userId: string) => { setUserToDeleteId(userId); setIsDeleteUserConfirmOpen(true); };
  
  const confirmDeleteUser = async () => { /* ... Placeholder ... */ };
  const handleSaveUser = async (userData: Pick<User, 'username' | 'namaLengkap' | 'role'> & { password?: string }, docId?: string) => { /* ... Placeholder: Supabase Admin API for user creation, then profile insert/update ... */ };


   const handleSavePesantrenProfile = async (data: Omit<PesantrenProfileData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const currentProfile = pesantrenProfileData; 
      if (currentProfile && currentProfile.id) {
        const { error } = await supabase.from('pesantren_profile').update(data).eq('id', currentProfile.id);
        if (error) throw error;
      } else { 
        const { error } = await supabase.from('pesantren_profile').insert({ ...data, id: crypto.randomUUID() });
        if (error) throw error;
      }
      await fetchPesantrenProfile();
      alert("Profil Pesantren berhasil disimpan.");
    } catch (error: any) { console.error("Error saving pesantren profile:", error); alert(`Gagal menyimpan profil pesantren: ${error.message}`);}
  };

  const handleExportSantriDetailToPdf = async (santriToPrint: Santri): Promise<void> => { 
      const namaKelas = kelasRecords.find(k => k.id === santriToPrint.kelasid)?.namaKelas;
      const namaBlok = blokRecords.find(b => b.id === santriToPrint.blokid)?.namaBlok;
      setSantriDetailPrintData({ santri: santriToPrint, pesantrenProfile: pesantrenProfileData, printedByUserName: supabaseAuthUser?.email || userRoleDisplayNames[currentUserRole], namaKelas, namaBlok, pasFotoUrlForPdf: santriToPrint.pasfotourl });
      setTimeout(() => window.print(), 500);
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
    return list.sort((a, b) => a.namalengkap.localeCompare(b.namalengkap));
  }, [santriList]); 
  
  const munjizList = useMemo((): Santri[] => { return []; }, []); 
  const filteredMunjizList = useCallback((): Santri[] => { return []; }, []); 
  
  // Placeholder functions for features not fully re-implemented in this step
  const handleAddBillDefinitionClick = () => { /* ... */ };
  const handleEditBillDefinitionClick = (billDef: BillDefinition) => { /* ... */ };
  const handleDeleteBillDefinitionClick = (billDefId: string) => { /* ... */ };
  const confirmDeleteBillDefinition = async () => { /* ... */ };
  const handleSaveBillDefinition = async (billDefData: Omit<BillDefinition, 'id' | 'created_at' | 'updated_at'>, docId?: string) => { /* ... */ };
  const handleOpenPaymentConfirmationModal = (data: PaymentConfirmationData) => { /* ... */ };
  const handleConfirmPayment = async ( santriId: string, billDefinitionId: string, billingPeriod: string, amountPaid: number, paymentMethod: PaymentMethod, notes?: string ) => { /* ... */ };
  const handleSaveAttendance = async (newRecordsForDate: AttendanceRecord[]) => { /* ... */ };
  const handleExportRekapAbsensiToPdf = ( rekapData: AttendanceSummary[], periodDescription: string, selectedKelas: string, generatedByUserName: string ) => { /* ... */ };
  const handleAddLeavePermit = async (permit: Omit<LeavePermitRecord, 'id' | 'created_at' | 'updated_at' | 'recordedAt' | 'durationMinutes' | 'actualReturnDate' | 'actualReturnTime'>) => { /* ... */ };
  const handleMarkSantriAsReturned = async (permitId: string, actualReturnDate: string, actualReturnTime?: string | null) => { /* ... */ };
  const handleCoretKtt = async (santriId: string, dismissalDate: string, reason: string) => { /* ... */ };
  const handleExportCoretKttToPdf = (coretRecord: CoretKttRecord) => { /* ... */ };
  const handleAddKelasClick = () => { /* ... */ };
  const handleEditKelasClick = (kelas: KelasRecord) => { /* ... */ };
  const handleDeleteKelasClick = (id: string) => { /* ... */ };
  const confirmDeleteKelas = async () => { /* ... */ };
  const handleSaveKelas = async (data: Omit<KelasRecord, 'id' | 'created_at' | 'updated_at'>, docId?: string) => { /* ... */ };
  const handleAddBlokClick = () => { /* ... */ };
  const handleEditBlokClick = (blok: BlokRecord) => { /* ... */ };
  const handleDeleteBlokClick = (id: string) => { /* ... */ };
  const confirmDeleteBlok = async () => { /* ... */ };
  const handleSaveBlok = async (data: Omit<BlokRecord, 'id' | 'created_at' | 'updated_at'>, docId?: string) => { /* ... */ };
  const handleSaveIqsamExam = (exam: IqsamExamPayload, existingExamId?: string): string => { return existingExamId || crypto.randomUUID(); };
  const handleSaveIqsamScoreRecords = async (records: IqsamScorePayload[]) => { /* ... */ };
  const handleDeleteIqsamExamAndScores = async (examId: string) => { /* ... */ };
  const handleSaveTamrinExam = (exam: TamrinExamPayload, existingExamId?: string): string => { return existingExamId || crypto.randomUUID(); };
  const handleSaveTamrinScoreRecords = async (records: TamrinScorePayload[]) => { /* ... */ };
  const handleDeleteTamrinExamAndScores = async (examId: string) => { /* ... */ };


  const renderView = () => { 
    if (isLoadingAppData && isLoggedIn) {
        return <PlaceholderView title="Memuat Data" message="Sedang mengambil data dari Supabase..." />;
    }
    
    const accessibleViews = menuAccessConfig[currentUserRole] || [];
    if (!accessibleViews.includes(activeView) && activeView !== 'Dashboard') {
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
      default: return <PlaceholderView title={activeView} message="Halaman ini belum diimplementasikan sepenuhnya dengan Supabase." />;
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
            {authError && isLoggedIn && ( 
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                {authError}
              </div>
            )}
            {renderView()}
          </div>
        </main>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={currentSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}>
        <SantriForm onSubmit={handleSaveSantri} initialData={currentSantri} onClose={() => setIsFormModalOpen(false)} kelasRecords={kelasRecords} blokRecords={blokRecords}/>
      </Modal>
      <UserFormModal isOpen={isUserFormModalOpen} onClose={() => setIsUserFormModalOpen(false)} onSubmit={handleSaveUser} initialData={currentUserToEdit} />
      <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDeleteSantri} title="Konfirmasi Hapus Santri" message={`Apakah Anda yakin ingin menghapus data santri ini? Tindakan ini tidak dapat diurungkan.`} confirmButtonText="Ya, Hapus Santri" />
      <ConfirmationModal isOpen={isDeleteUserConfirmOpen} onClose={() => setIsDeleteUserConfirmOpen(false)} onConfirm={confirmDeleteUser} title="Konfirmasi Hapus Pengguna" message="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat diurungkan." confirmButtonText="Ya, Hapus Pengguna" />
      {/* ... other modals ... */}
      <AboutUsModal isOpen={isAboutUsModalOpen} onClose={() => setIsAboutUsModalOpen(false)} />
      {santriDetailPrintData && (
          <div className="print-only fixed top-0 left-0 w-full h-full bg-white z-[100] overflow-auto">
            <SantriDetailPrintout {...santriDetailPrintData} />
          </div>
        )}
    </div>
  );
};

export default App;
