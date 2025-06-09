
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Santri, User, BillDefinition, SantriPaymentRecord, AttendanceRecord, 
  PesantrenProfileData, LeavePermitRecord, CoretKttRecord, KelasRecord, BlokRecord, 
  IqsamExam, IqsamScoreRecord, TamrinExam, TamrinScoreRecord,
  IqsamRegistrationRecord, IqsamResult // Added missing types
} from '../types'; // Ensure these types do not extend AppwriteDocument

const SUPABASE_URL = "https://ukpmesdxhbixxvdudxuo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcG1lc2R4aGJpeHh2ZHVmeHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTgwMTQsImV4cCI6MjA2NTA3NDAxNH0.1z-x-wwh87MaQAXoWAqINTNwGSocsU-9YYjLcA_I2IM";

// Define the Database interface based on your types
// All types used here (Santri, User, etc.) should be plain objects without AppwriteDocument fields.
// Add 'id' and 'created_at' (and 'updated_at' if used) as Supabase typically has these.
// For Insert/Update types, these system fields are often optional.

type WithSupabaseTimestamps<T> = Omit<T, 'id'> & { id: string; created_at?: string; updated_at?: string; };

type SantriRow = WithSupabaseTimestamps<Santri>;
type UserRow = WithSupabaseTimestamps<User>; // User 'id' will link to auth.users.id
type BillDefinitionRow = WithSupabaseTimestamps<BillDefinition>;
type SantriPaymentRecordRow = WithSupabaseTimestamps<SantriPaymentRecord>;
type AttendanceRecordRow = WithSupabaseTimestamps<AttendanceRecord>;
type PesantrenProfileDataRow = WithSupabaseTimestamps<PesantrenProfileData>;
type LeavePermitRecordRow = WithSupabaseTimestamps<LeavePermitRecord>;
type CoretKttRecordRow = WithSupabaseTimestamps<CoretKttRecord>;
type KelasRecordRow = WithSupabaseTimestamps<KelasRecord>;
type BlokRecordRow = WithSupabaseTimestamps<BlokRecord>;

type IqsamExamRow = WithSupabaseTimestamps<IqsamExam>;
type IqsamRegistrationRecordRow = WithSupabaseTimestamps<IqsamRegistrationRecord>;
type IqsamScoreRecordRow = WithSupabaseTimestamps<IqsamScoreRecord>;
type IqsamResultRow = WithSupabaseTimestamps<IqsamResult>;

type TamrinExamRow = WithSupabaseTimestamps<TamrinExam>;
type TamrinScoreRecordRow = WithSupabaseTimestamps<TamrinScoreRecord>;


export interface Database {
  public: {
    Tables: {
      santri: {
        Row: SantriRow;
        Insert: Partial<SantriRow>;
        Update: Partial<Omit<SantriRow, 'id' | 'created_at'>>;
      };
      user_profiles: {
        Row: UserRow;
        Insert: Partial<UserRow>; // id should be auth.users.id
        Update: Partial<Omit<UserRow, 'id' | 'created_at'>>;
      };
      bill_definitions: {
        Row: BillDefinitionRow;
        Insert: Partial<BillDefinitionRow>;
        Update: Partial<Omit<BillDefinitionRow, 'id' | 'created_at'>>;
      };
      santri_payments: {
        Row: SantriPaymentRecordRow;
        Insert: Partial<SantriPaymentRecordRow>;
        Update: Partial<Omit<SantriPaymentRecordRow, 'id' | 'created_at'>>;
      };
      attendance_records: {
        Row: AttendanceRecordRow;
        Insert: Partial<AttendanceRecordRow>;
        Update: Partial<Omit<AttendanceRecordRow, 'id' | 'created_at'>>;
      };
      pesantren_profile: { // Likely a single row table
        Row: PesantrenProfileDataRow;
        Insert: Partial<PesantrenProfileDataRow>;
        Update: Partial<Omit<PesantrenProfileDataRow, 'id' | 'created_at'>>;
      };
      leave_permits: {
        Row: LeavePermitRecordRow;
        Insert: Partial<LeavePermitRecordRow>;
        Update: Partial<Omit<LeavePermitRecordRow, 'id' | 'created_at'>>;
      };
      coret_ktt_records: {
        Row: CoretKttRecordRow;
        Insert: Partial<CoretKttRecordRow>;
        Update: Partial<Omit<CoretKttRecordRow, 'id' | 'created_at'>>;
      };
      kelas_records: {
        Row: KelasRecordRow;
        Insert: Partial<KelasRecordRow>;
        Update: Partial<Omit<KelasRecordRow, 'id' | 'created_at'>>;
      };
      blok_records: {
        Row: BlokRecordRow;
        Insert: Partial<BlokRecordRow>;
        Update: Partial<Omit<BlokRecordRow, 'id' | 'created_at'>>;
      };
      iqsam_exams: {
        Row: IqsamExamRow;
        Insert: Partial<IqsamExamRow>;
        Update: Partial<Omit<IqsamExamRow, 'id' | 'created_at'>>;
      };
      iqsam_registrations: { // Added
        Row: IqsamRegistrationRecordRow;
        Insert: Partial<IqsamRegistrationRecordRow>;
        Update: Partial<Omit<IqsamRegistrationRecordRow, 'id' | 'created_at'>>;
      };
      iqsam_score_records: {
        Row: IqsamScoreRecordRow;
        Insert: Partial<IqsamScoreRecordRow>;
        Update: Partial<Omit<IqsamScoreRecordRow, 'id' | 'created_at'>>;
      };
      iqsam_results: { // Added
        Row: IqsamResultRow;
        Insert: Partial<IqsamResultRow>;
        Update: Partial<Omit<IqsamResultRow, 'id' | 'created_at'>>;
      };
      tamrin_exams: {
        Row: TamrinExamRow;
        Insert: Partial<TamrinExamRow>;
        Update: Partial<Omit<TamrinExamRow, 'id' | 'created_at'>>;
      };
      tamrin_score_records: {
        Row: TamrinScoreRecordRow;
        Insert: Partial<TamrinScoreRecordRow>;
        Update: Partial<Omit<TamrinScoreRecordRow, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}

export const supabase: SupabaseClient<Database> = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
