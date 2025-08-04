import React, { useCallback, useMemo, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTheme } from '../hooks/useTheme';
import { CaseChecklist } from '../types';

interface CreateCaseBottomSheetProps {
  editingChecklist: CaseChecklist | null;
  newCaseName: string;
  renamingName: string;
  isInputFocused: boolean;
  onNewCaseNameChange: (text: string) => void;
  onRenamingNameChange: (text: string) => void;
  onInputFocus: () => void;
  onInputBlur: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

export interface CreateCaseBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const CreateCaseBottomSheet = forwardRef<CreateCaseBottomSheetRef, CreateCaseBottomSheetProps>(
  ({
    editingChecklist,
    newCaseName,
    renamingName,
    isInputFocused,
    onNewCaseNameChange,
    onRenamingNameChange,
    onInputFocus,
    onInputBlur,
    onSubmit,
    onClose,
  }, ref) => {
    const { colors } = useTheme();
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const textInputRef = useRef<any>(null);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = React.useState(false);

    // Single snap point - let library handle keyboard positioning
    const snapPoints = useMemo(() => ['35%'], []);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.expand(),
      dismiss: () => bottomSheetRef.current?.close(),
    }));

    // Custom backdrop component with iOS-style animation
    const renderBackdrop = useCallback((props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ), []);

    // Handle bottom sheet changes
    const handleSheetChanges = useCallback((index: number) => {
      setIsBottomSheetVisible(index >= 0);
      if (index === -1) {
        onClose(); // Sheet was dismissed
      }
    }, [onClose]);

    // Focus input when bottom sheet becomes visible
    useEffect(() => {
      if (isBottomSheetVisible) {
        // Small delay to ensure the bottom sheet animation has started
        const focusTimeout = setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(focusTimeout);
      }
    }, [isBottomSheetVisible]);

    // No manual repositioning needed - library handles it

    // Handle submit with validation
    const handleSubmit = () => {
      const currentName = editingChecklist ? renamingName : newCaseName;
      if (!currentName.trim()) {
        Alert.alert('Hata', 'Görev adı boş olamaz.');
        return;
      }
      onSubmit();
      bottomSheetRef.current?.close();
    };

    // Handle cancel
    const handleCancel = () => {
      textInputRef.current?.blur(); // Dismiss keyboard first
      bottomSheetRef.current?.close();
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Start closed
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
        style={styles.bottomSheet}
        keyboardBehavior="interactive" // iOS-optimized keyboard handling
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={[styles.content, { backgroundColor: colors.card }]}>
            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]}>
              {editingChecklist ? 'Görevi Yeniden Adlandır' : 'Yeni CMK Görevi'}
            </Text>

            {/* Input */}
            <BottomSheetTextInput
              ref={textInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: isInputFocused ? colors.accent : colors.border,
                }
              ]}
              placeholder="Görev Adı (Örn: Ahmet Yılmaz Dosyası)"
              placeholderTextColor={colors.placeholder}
              value={editingChecklist ? renamingName : newCaseName}
              onChangeText={editingChecklist ? onRenamingNameChange : onNewCaseNameChange}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              returnKeyType="done"
              onSubmitEditing={() => textInputRef.current?.blur()}
            />

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.destructive }]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: WHITE_COLOR }]}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.submitButton, { backgroundColor: colors.accent }]}
                onPress={handleSubmit}
              >
                <Text style={[styles.buttonText, { color: WHITE_COLOR }]}>
                  {editingChecklist ? 'Kaydet' : 'Oluştur'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const WHITE_COLOR = '#FFFFFF';

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 8, // Less padding at top since handle provides visual separation
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        fontWeight: '600', // iOS system font weight
      },
    }),
  },
  input: {
    borderWidth: 1,
    borderRadius: 12, // iOS-style rounded corners
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        borderRadius: 12,
        fontSize: 17, // iOS system font size
      },
    }),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        borderRadius: 12,
        paddingVertical: 16, // iOS button padding
      },
    }),
  },
  cancelButton: {
    // Destructive button styling handled by backgroundColor prop
  },
  submitButton: {
    // Primary button styling handled by backgroundColor prop
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '600',
      },
    }),
  },
});

export default CreateCaseBottomSheet;