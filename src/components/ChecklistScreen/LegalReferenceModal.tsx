import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { LegalReference } from '../../types';
import { formatDate, isContentOld, getContentAgeWarning } from '../../utils/contentHelpers';

interface LegalReferenceModalProps {
  selectedKeyword: {
    word: string;
    note: string;
    reference?: LegalReference;
  } | null;
  onClose: () => void;
}

export const LegalReferenceModal: React.FC<LegalReferenceModalProps> = ({
  selectedKeyword,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!selectedKeyword) return null;

  return (
    <Modal
      visible={selectedKeyword !== null}
      transparent={Platform.OS === 'android'}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
    >
      {Platform.OS === 'ios' ? (
        <View style={[styles.modalContentIOS, { backgroundColor: colors.card }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedKeyword.word}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              <Text style={[styles.modalCloseButtonText, { color: colors.accent }]}>╳</Text>
            </TouchableOpacity>
          </View>
          <ScrollView bounces={true} showsVerticalScrollIndicator={true}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              {selectedKeyword.note}
            </Text>
            {selectedKeyword.reference && (
              <View style={[styles.metadataContainer, { borderTopColor: colors.border }]}>
                <Text style={[styles.lastUpdated, { color: colors.secondaryText }]}>
                  Son Güncelleme: {formatDate(selectedKeyword.reference.lastUpdated)}
                </Text>
                {isContentOld(selectedKeyword.reference.lastUpdated) && (
                  <Text style={[styles.warningText, { color: colors.warning }]}>
                    {getContentAgeWarning(selectedKeyword.reference.lastUpdated)}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedKeyword.word}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.modalCloseButton}
              >
                <Text style={[styles.modalCloseButtonText, { color: colors.accent }]}>╳</Text>
              </TouchableOpacity>
            </View>
            <ScrollView bounces={true} showsVerticalScrollIndicator={true}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {selectedKeyword.note}
              </Text>
              {selectedKeyword.reference && (
                <View style={[styles.metadataContainer, { borderTopColor: colors.border }]}>
                  <Text style={[styles.lastUpdated, { color: colors.secondaryText }]}>
                    Son Güncelleme: {formatDate(selectedKeyword.reference.lastUpdated)}
                  </Text>
                  {isContentOld(selectedKeyword.reference.lastUpdated) && (
                    <Text style={[styles.warningText, { color: colors.warning }]}>
                      {getContentAgeWarning(selectedKeyword.reference.lastUpdated)}
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  modalContentIOS: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
  },
  metadataContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor will be set dynamically
    marginTop: 8,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});