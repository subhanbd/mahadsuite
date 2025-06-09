
export enum JenisKelamin {
  LAKI_LAKI = 'Laki-laki',
  PEREMPUAN = 'Perempuan',
}

export enum SantriStatus {
  AKTIF = 'Aktif',
  ALUMNI = 'Alumni',
}

export enum Kewarganegaraan {
  WNI = 'WNI',
  WNA = 'WNA',
}

export enum TingkatPendidikan {
  TIDAK_SEKOLAH = 'Tidak Sekolah',
  PAUD = 'PAUD/TK/RA',
  SD = 'SD/MI Sederajat',
  SMP = 'SMP/MTS Sederajat',
  SMA = 'SMA/MA/SMK Sederajat',
  D1 = 'Diploma 1 (D1)',
  D2 = 'Diploma 2 (D2)',
  D3 = 'Diploma 3 (D3)',
  D4 = 'Sarjana Terapan (D4)',
  S1 = 'Strata 1 (S1)',
  S2 = 'Strata 2 (S2)',
  S3 = 'Strata 3 (S3)',
  LAINNYA = 'Lainnya',
}

export enum JenisPendidikanTerakhir {
  FORMAL = 'Pendidikan Formal',
  NON_FORMAL = 'Pendidikan Non-Formal',
  FORMAL_DAN_NON_FORMAL = 'Pendidikan Formal dan Non-Formal',
  TIDAK_SEKOLAH = 'Tidak Pernah Sekolah/Tidak Ada',
}

export type AppView = 
  'Dashboard' | 
  'DataSantri' | 
  'DataAlumni' | 
  'UserManagement' | 
  'FinancialManagement' | 
  'SantriPaymentManagement' | 
  'Absensi' | 
  'RekapAbsensi' | 
  'PesantrenProfile' | 
  'PerizinanSantri' | 
  'CoretKtt' |
  'KelasManagement' |    
  'BlokManagement' |     
  'KetuaBlokList' |
  'DataMunjiz' |
  'ManajemenUjianIqsam' |
  'ManajemenUjianTamrin';


export enum UserRole {
  ADMINISTRATOR_UTAMA = 'Administrator Utama',
  ASATIDZ = 'Asatidz',
  SEKRETARIAT_SANTRI = 'Sekretariat Santri',
  BENDAHARA = 'Bendahara',
  KEAMANAN = 'Keamanan',
}

export enum StatusHidup {
  MASIH_ADA = 'Masih Ada',
  SUDAH_MENINGGAL = 'Sudah Meninggal',
}

export enum StatusKealumnian {
  ALUMNI = 'Alumni',
  BUKAN_ALUMNI = 'Bukan Alumni',
}

export enum StatusKeorganisasian {
  AKTIF = 'Aktif',
  TIDAK_AKTIF = 'Tidak Aktif',
}

export enum PilihanYaTidak {
  YA = 'Ya',
  TIDAK = 'Tidak',
}

export enum IdentitasWali {
  AYAH = 'Ayah Kandung',
  KAKEK = 'Kakek',
  PAMAN = 'Paman',
  KAKAK_KANDUNG = 'Kakak Kandung',
  LAINNYA = 'Lainnya',
}

export const userRoleDisplayNames: Record<UserRole, string> = {
  [UserRole.ADMINISTRATOR_UTAMA]: 'Administrator Utama',
  [UserRole.ASATIDZ]: 'Asatidz',
  [UserRole.SEKRETARIAT_SANTRI]: 'Sekretariat Santri',
  [UserRole.BENDAHARA]: 'Bendahara',
  [UserRole.KEAMANAN]: 'Keamanan',
};

export type SupabaseDefaultFields = 'id' | 'created_at' | 'updated_at';

export interface Santri {
  id: string; // UUID, primary key
  namalengkap: string; 
  namapanggilan?: string; 
  nomorindukkependudukan?: string; 
  nomorkartukeluarga?: string; 
  nomorktt?: string; 
  kewarganegaraan?: Kewarganegaraan;
  negaraasal?: string; 
  suku?: string;
  tempatlahir: string; 
  tanggallahir: string; 
  jeniskelamin: JenisKelamin; 
  
  provinsi?: string;
  kotakabupaten?: string; 
  kecamatan?: string;
  desakelurahan?: string; 
  dusun?: string;
  rt?: string;
  rw?: string;
  alamatlengkap: string; 
  
  hobi?: string;
  citacita?: string; 
  bakat?: string;

  jenispendidikanterakhir?: JenisPendidikanTerakhir; 
  tingkatpendidikanterakhir?: TingkatPendidikan; 
  namalembagapendidikanterakhir?: string; 
  tahunmasukformal?: string; 
  tahunkeluarformal?: string; 

  namalembaganonformal?: string; 
  tahunmasuknonformal?: string; 
  tahunkeluarnonformal?: string; 

  namaayah?: string; 
  nikayah?: string; 
  pekerjaanayah?: string; 
  statushidupayah?: StatusHidup; 
  statuskealumnianayah?: StatusKealumnian; 
  tahunmasukalumniayah?: string; 
  tahunkeluaralumniayah?: string; 
  isayahorganisasi?: PilihanYaTidak; 
  namaorganisasiayah?: string; 
  statusorganisasiayah?: StatusKeorganisasian; 
  isalamatayahsama?: PilihanYaTidak; 
  alamatlengkapayah?: string; 
  provinsiayah?: string; 
  kotakabupatenayah?: string; 
  kecamatanayah?: string; 
  desakelurahanayah?: string; 
  dusunayah?: string; 
  rtayah?: string; 
  rwayah?: string; 

  namaibu?: string; 
  nikibu?: string; 
  pekerjaanibu?: string; 
  statushidupibu?: StatusHidup; 
  isibuorganisasi?: PilihanYaTidak; 
  namaorganisasiibu?: string; 
  statusorganisasiibu?: StatusKeorganisasian; 
  isalamatibusama?: PilihanYaTidak; 
  alamatlengkapibu?: string; 
  provinsiibu?: string; 
  kotakabupatenibu?: string; 
  kecamatanibu?: string; 
  desakelurahanibu?: string; 
  dusunibu?: string; 
  rtibu?: string; 
  rwibu?: string; 
  
  nomorteleponorangtua?: string; 

  namawali: string; 
  nikwali?: string; 
  nomorteleponwali: string; 
  identitaswaliutama?: IdentitasWali | ''; 
  hubunganwalilainnya?: string; 
  pekerjaanwali?: string; 
  statuskealumnianwali?: StatusKealumnian; 
  tahunmasukalumniwali?: string; 
  tahunkeluaralumniwali?: string; 
  isalamatwalisama?: PilihanYaTidak; 
  alamatlengkapwali?: string; 
  provinsiwali?: string; 
  kotakabupatenwali?: string; 
  kecamatanwali?: string; 
  desakelurahanwali?: string; 
  dusunwali?: string; 
  rtwali?: string; 
  rwwali?: string; 

  namawakilwali?: string; 
  nikwakilwali?: string; 
  nomorteleponwakilwali?: string; 
  pekerjaanwakilwali?: string; 
  hubunganwakilwali?: IdentitasWali | ''; 
  hubunganwakilwalilainnya?: string; 
  statuskealumnianwakilwali?: StatusKealumnian; 
  tahunmasukalumniwakilwali?: string; 
  tahunkeluaralumniwakilwali?: string; 
  isalamatwakilwalisama?: PilihanYaTidak; 
  alamatlengkapwakilwali?: string; 
  provinsiwakilwali?: string; 
  kotakabupatenwakilwali?: string; 
  kecamatanwakilwali?: string; 
  desakelurahanwakilwali?: string; 
  dusunwakilwali?: string; 
  rtwakilwali?: string; 
  rwwakilwali?: string; 

  tanggalmasuk: string; 
  kelasid?: string; 
  blokid?: string;  
  nomorkamar?: string; 
  catatan?: string;
  
  pasfotourl?: string; 
  dokumendomisilibase64?: string; 

  status: SantriStatus;
  daerahasal: string; 
  created_at?: string; 
  updated_at?: string; 
}


export const menuAccessConfig: Partial<Record<UserRole, AppView[]>> = {
  [UserRole.ADMINISTRATOR_UTAMA]: [
    'Dashboard', 'DataSantri', 'DataAlumni', 'DataMunjiz', 'UserManagement', 
    'FinancialManagement', 'SantriPaymentManagement', 'Absensi', 'RekapAbsensi', 
    'PesantrenProfile', 'PerizinanSantri', 'CoretKtt',
    'KelasManagement', 'BlokManagement', 'KetuaBlokList',
    'ManajemenUjianIqsam', 'ManajemenUjianTamrin',
  ],
  [UserRole.ASATIDZ]: [
    'Dashboard', 'Absensi', 'RekapAbsensi', 
    'ManajemenUjianIqsam', 'ManajemenUjianTamrin',
  ],
  [UserRole.SEKRETARIAT_SANTRI]: [
    'Dashboard', 'DataSantri', 'DataAlumni', 'DataMunjiz', 'PerizinanSantri', 'CoretKtt',
    'KelasManagement', 'BlokManagement', 'KetuaBlokList',
    'ManajemenUjianIqsam', 'ManajemenUjianTamrin',
  ],
  [UserRole.BENDAHARA]: ['Dashboard', 'FinancialManagement', 'SantriPaymentManagement'],
  [UserRole.KEAMANAN]: ['Dashboard', 'PerizinanSantri'], 
};

export interface RegionOption {
  id: string; 
  name: string;
}

export const daftarNegara: string[] = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
export const daftarSukuIndonesia: string[] = [
    "Jawa", "Sunda", "Batak (Toba, Karo, Simalungun, Pakpak, Angkola, Mandailing)", "Minangkabau", "Bugis", "Madura", "Betawi", "Dayak (Ngaju, Iban, Kenyah, Kayan, Punan, dll.)", 
    "Bali (Bali Aga, Bali Majapahit)", "Sasak", "Asmat", "Ambon", "Melayu (Riau, Deli, Pontianak, dll.)", "Toraja", "Papua (Dani, Lani, Yali, Mee, Biak, dll.)", "Aceh", "Lampung (Pepadun, Saibatin)", "Banten",
    "Nias", "Mentawai", "Flores (Manggarai, Ngada, Ende, Sikka, Larantuka)", "Sumba", "Timor (Atoni, Tetun)", "Alor", "Rote", "Sabu",
    "Makassar", "Mandar", "Gorontalo", "Minahasa", "Mongondow", "Sangir", "Talaud",
    "Banjar", "Kutai", "Pasir", "Berau",
    "Gayo", "Alas", "Simeulue",
    "Rejang", "Serawai", "Kerinci",
    "Baduy", "Ciptagelar",
    "Tionghoa-Indonesia", "Arab-Indonesia", "India-Indonesia",
    "Lainnya"
];


// --- APP DATA ---
// Data Pendidikan
export const daftarTingkatPendidikan: TingkatPendidikan[] = Object.values(TingkatPendidikan);
export const daftarJenisPendidikanTerakhir: JenisPendidikanTerakhir[] = Object.values(JenisPendidikanTerakhir);

// Data Santri
export const daftarStatusSantriForm: SantriStatus[] = [SantriStatus.AKTIF, SantriStatus.ALUMNI];


// Data Orang Tua & Wali
export const daftarStatusHidup: StatusHidup[] = Object.values(StatusHidup);
export const daftarStatusKealumnian: StatusKealumnian[] = Object.values(StatusKealumnian);
export const daftarStatusKeorganisasian: StatusKeorganisasian[] = Object.values(StatusKeorganisasian);
export const daftarPilihanYaTidak: PilihanYaTidak[] = Object.values(PilihanYaTidak);
export const daftarIdentitasWali: IdentitasWali[] = Object.values(IdentitasWali);


// --- USER MANAGEMENT ---
export interface User { 
  id: string; 
  username: string; 
  namaLengkap: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}
export const assignableUserRoles: UserRole[] = [
  UserRole.ASATIDZ,
  UserRole.SEKRETARIAT_SANTRI,
  UserRole.BENDAHARA,
  UserRole.KEAMANAN,
  UserRole.ADMINISTRATOR_UTAMA, 
];


// --- FINANCIAL MANAGEMENT ---
export interface BillDefinition {
  id: string; 
  namaTagihan: string;
  nominal: number;
  tanggalJatuhTempo: number; 
  periodeTahun?: string; 
  tanggalMulaiPenagihan?: string; 
  tanggalAkhirPenagihan?: string; 
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
}

// --- SANTRI PAYMENT MANAGEMENT ---
export enum PaymentStatus {
  LUNAS = 'Lunas',
  BELUM_LUNAS = 'Belum Lunas',
  JATUH_TEMPO = 'Jatuh Tempo', 
}
export enum PaymentMethod {
  TUNAI = 'Tunai',
  TRANSFER_BANK = 'Transfer Bank',
  LAINNYA = 'Lainnya',
}
export const daftarPaymentMethod: PaymentMethod[] = Object.values(PaymentMethod);

export interface SantriPaymentRecord {
  id: string; 
  santriId: string; 
  billDefinitionId: string; 
  billingPeriod: string; 
  paymentStatus: PaymentStatus;
  amountPaid: number;
  paymentDate: string; 
  paymentMethod: PaymentMethod;
  notes?: string;
  recordedAt: string; 
  created_at?: string;
  updated_at?: string;
}
export interface PaymentConfirmationData {
  santriId: string;
  santriName: string;
  billDefinitionId: string;
  billName: string;
  billingPeriod: string;
  nominalToPay: number;
}


// --- ABSENSI ---
export enum AttendanceStatus {
  HADIR = 'Hadir',
  SAKIT = 'Sakit',
  IZIN = 'Izin',
  ALPA = 'Alpa',
}
export const daftarAttendanceStatus: AttendanceStatus[] = Object.values(AttendanceStatus);

export interface AttendanceRecord {
  id: string; 
  santriId: string; 
  date: string; 
  status: AttendanceStatus;
  notes?: string;
  recordedAt: string; 
  recordedBy: string; 
  created_at?: string;
  updated_at?: string;
}
export interface AttendanceSummary {
  santriId: string;
  namaLengkap: string;
  nomorKTT?: string;
  kelas?: string; 
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  totalRecords: number;
  persentaseKehadiran: number;
}
export type RekapFilterType = 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan';

export interface RekapAbsensiPrintData {
  rekapData: AttendanceSummary[];
  periodDescription: string;
  selectedKelas: string; 
  pesantrenName: string;
  pesantrenAlamat?: string;
  pesantrenTelepon?: string;
  generatedByUserName: string;
}

// --- PESANTREN PROFILE ---
export interface PesantrenProfileData {
  id: string; 
  namaPesantren: string;
  alamatLengkap: string;
  kotaKabupaten?: string; 
  nomorTelepon?: string;
  created_at?: string;
  updated_at?: string;
}

// --- SANTRI DETAIL PDF EXPORT ---
export interface SantriDetailPrintData {
    santri: Santri; 
    pesantrenProfile: PesantrenProfileData;
    printedByUserName: string;
    namaKelas?: string; 
    namaBlok?: string;  
    pasFotoUrlForPdf?: string; 
}

// --- PERIZINAN SANTRI ---
export enum LeaveType {
  PULANG_KE_RUMAH = 'Pulang ke Rumah',
  IZIN_KELUAR_SEMENTARA = 'Izin Keluar Sementara (Jam)',
  IZIN_KEPERLUAN_PESANTREN = 'Izin Keperluan Pesantren',
  LAINNYA = 'Lainnya',
}
export enum LeavePermitStatus {
  IZIN = 'Izin Diberikan',
  KEMBALI = 'Sudah Kembali',
  TERLAMBAT = 'Terlambat Kembali', 
}
export const daftarLeaveType: LeaveType[] = Object.values(LeaveType);
export const daftarLeavePermitStatus: LeavePermitStatus[] = Object.values(LeavePermitStatus);

export interface LeavePermitRecord {
  id: string; 
  santriId: string; 
  leaveType: LeaveType;
  reason?: string;
  leaveDate: string; 
  leaveTime?: string | null; 
  expectedReturnDate: string; 
  expectedReturnTime?: string | null; 
  actualReturnDate?: string | null; 
  actualReturnTime?: string | null; 
  status: LeavePermitStatus;
  durationMinutes?: number | null; 
  recordedBy: string; 
  recordedAt: string; 
  created_at?: string;
  updated_at?: string;
}

// --- CORET KTT ---
export interface CoretKttRecord {
  id: string; 
  santriId: string; 
  santriNamaLengkap: string; 
  santriNomorKTT?: string;   
  santriKelasTerakhir?: string; 
  tanggalMasukPesantren: string; 
  tanggalLahirSantri: string; 
  dismissalDate: string; 
  reason: string;
  durationOfStay: string; 
  ageAtDismissal: string; 
  recordedBy: string; 
  recordedAt: string; 
  created_at?: string;
  updated_at?: string;
}

export type SantriDetailForCoretPrint = Pick<
  Santri, 
  'namalengkap' | 
  'nomorktt' | 
  'tempatlahir' | 
  'tanggallahir' | 
  'tanggalmasuk' | 
  'alamatlengkap' | 
  'provinsi' | 
  'kotakabupaten' | 
  'kecamatan' | 
  'desakelurahan' | 
  'dusun' | 
  'rt' | 
  'rw'
> & { kelasnama?: string }; 

export interface CoretKttPrintData {
  pesantrenProfile: PesantrenProfileData;
  coretRecord: CoretKttRecord;
  santriDetails: SantriDetailForCoretPrint;
}


// --- KELAS MANAGEMENT ---
export interface KelasRecord {
  id: string; 
  namaKelas: string;
  urutanTampilan?: number;
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
}

// --- BLOK MANAGEMENT ---
export interface BlokRecord {
  id: string; 
  namaBlok: string;
  ketuaBlokSantriId?: string; 
  jumlahKamar?: number;
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
}

// --- REFACTORED UJIAN MANAGEMENT ---
export enum IqsamPeriodeRefactored { 
  AWAL_TAHUN = 'Iqsam Awal Tahun', 
  AKHIR_TAHUN = 'Iqsam Akhir Tahun' 
}

export interface IqsamExam { 
  id: string; 
  kelasId: string; 
  periode: IqsamPeriodeRefactored;
  tahunAjaran: string; 
  mataPelajaran: string; 
  tanggalUjian: string; 
  jamMulaiUjian?: string; 
  jamSelesaiUjian?: string; 
  tanggalBukaPendaftaran?: string; 
  tanggalTutupPendaftaran?: string; 
  status?: IqsamSessionStatus; 
  deskripsi?: string; 
  created_at?: string;
  updated_at?: string;
}

export enum IqsamSessionStatus {
  PENDAFTARAN_DIBUKA = 'Pendaftaran Dibuka',
  PENDAFTARAN_DITUTUP = 'Pendaftaran Ditutup',
  SEDANG_BERLANGSUNG = 'Sedang Berlangsung',
  SELESAI = 'Selesai',
  DIBATALKAN = 'Dibatalkan',
}

export interface IqsamRegistrationRecord {
  id: string; 
  iqsamSessionId: string; 
  santriId: string; 
  tanggalRegistrasi: string; 
  created_at?: string;
  updated_at?: string;
}

export interface IqsamScoreRecord {
  id: string; 
  iqsamExamId: string; 
  santriId: string; 
  kehadiran: AttendanceStatus;
  nilaiAngka?: number; 
  catatan?: string;
  lastUpdatedAt: string; 
  created_at?: string;
}

export interface IqsamSubjectScore { 
  mataPelajaran: string; 
  nilaiAngka?: number;
  catatan?: string;
}

export interface IqsamResult { 
  id: string; 
  iqsamRegistrationId: string; 
  santriId: string; 
  iqsamSessionId: string; 
  kehadiranKeseluruhan: AttendanceStatus; 
  catatanKehadiran?: string;
  scores: IqsamSubjectScore[]; 
  lastUpdated: string; 
  created_at?: string;
  updated_at?: string; 
}


export interface TamrinExam { 
  id: string; 
  namaTamrin: string;
  kelasId: string; 
  asatidzId: string; 
  tanggalPelaksanaan: string; 
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
}
export type TamrinExamPayload = Omit<TamrinExam, 'id' | 'created_at' | 'updated_at'>;


export interface TamrinScoreRecord { 
  id: string; 
  tamrinExamId: string; 
  santriId: string; 
  kehadiran: AttendanceStatus;
  nilaiAngka?: number;
  nilaiHuruf?: string; 
  catatan?: string;
  lastUpdatedAt: string; 
  created_at?: string;
  updated_at?: string; 
}
export type TamrinScorePayload = Omit<TamrinScoreRecord, 'id' | 'created_at' | 'updated_at'>;
