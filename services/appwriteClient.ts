
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

export const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '68470a0600224b764a07';
export const APPWRITE_DATABASE_ID = '68470be1003a3405a625';
export const APPWRITE_BUCKET_ID_SANTRI_PHOTOS = '68471348002d8b5b1b92';

// Collection IDs
export const COLLECTION_ID_SANTRI = '684711d10038120fe30a';
export const COLLECTION_ID_USER_PROFILES = '684711df00311793100f';
export const COLLECTION_ID_BILL_DEFINITIONS = '6847121e001c908175cd';
export const COLLECTION_ID_SANTRI_PAYMENTS = '68471239000d90055ca5';
export const COLLECTION_ID_ATTENDANCE_RECORDS = '6847124f003a0373612c';
export const COLLECTION_ID_PESANTREN_PROFILE = '6847125e000517a23719';
export const COLLECTION_ID_LEAVE_PERMITS = '6847126b000a1a27fbcb';
export const COLLECTION_ID_CORET_KTT_RECORDS = '6847128e0008876dc767';
export const COLLECTION_ID_KELAS_RECORDS = '684712ba001493def751';
export const COLLECTION_ID_BLOK_RECORDS = '684712c50012017ae275';
export const COLLECTION_ID_IQSAM_EXAMS = '684712d7003589ce3773';
export const COLLECTION_ID_IQSAM_SCORE_RECORDS = '684712e8000a8844189e';
export const COLLECTION_ID_TAMRIN_EXAMS = '684712f3001110831c8b';
export const COLLECTION_ID_TAMRIN_SCORE_RECORDS = '6847130300288da6f820';


const client = new Client();
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query }; // Export ID and Query for use in other files
export { client }; // Export client explicitly
export default client; // Also export as default for potential legacy use, though named is preferred.
