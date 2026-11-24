import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ConfirmModal({
  visible,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  isDanger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={[styles.iconBox, { backgroundColor: isDanger ? '#FEF2F2' : COLORS.primaryLight }]}>
            <Ionicons
              name={isDanger ? 'alert-triangle' : 'help-circle'}
              size={24}
              color={isDanger ? COLORS.danger : COLORS.primary}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: isDanger ? COLORS.danger : COLORS.primary },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});

