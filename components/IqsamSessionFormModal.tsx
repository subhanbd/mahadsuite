
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { IqsamExam, IqsamPeriodeRefactored, IqsamSessionStatus, KelasRecord, SupabaseDefaultFields } from '../types'; 

type IqsamExamPayload = Omit<IqsamExam, keyof SupabaseDefaultFields>;

interface IqsamSessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IqsamExamPayload, id?: string) => void; 
  initialData?: IqsamExam | null; 
  kelasRecords: KelasRecord[];
}

const IqsamSessionFormModal: React.FC<IqsamSessionFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  kelasRecords
}) => {
  const getInitialState = (): IqsamExamPayload => ({ 
    kelasId: initialData?.kelasId || (kelasRecords.length > 0 ? kelasRecords[0].id : ''),
    tahunAjaran: initialData?.tahunAjaran || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    periode: initialData?.periode || IqsamPeriodeRefactored.AWAL_TAHUN, 
    tanggalBukaPendaftaran: initialData?.tanggalBukaPendaftaran || new Date().toISOString().split('T')[0],
    tanggalTutupPendaftaran: initialData?.tanggalTutupPendaftaran || new Date().toISOString().split('T')[0],
    tanggalUjian: initialData?.tanggalUjian || new Date().toISOString().split('T')[0],
    mataPelajaran: initialData?.mataPelajaran || '', 
    jamMulaiUjian: initialData?.jam