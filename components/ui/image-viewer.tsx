import ImageViewing from 'react-native-image-viewing';
import { Share, Alert, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Button } from './button';
import { useMemo } from 'react';
import { SaveIcon, ShareIcon } from 'lucide-react-native';

interface ImageViewerProps {
  visible: boolean;
  onRequestClose: () => void;
  imageUrl?: string;
  altText?: string;
}

export const ImageViewer = ({ visible, onRequestClose, imageUrl, altText }: ImageViewerProps) => {
  const imageData = useMemo(() => (
    imageUrl ? [{ uri: imageUrl, title: altText }] : []
  ), [imageUrl, altText]);

  const handleSave = async () => {
    if (!imageUrl) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save images');
        return;
      }

      const filename = imageUrl.split('/').pop() || 'image.jpg';
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status !== 200) {
        throw new Error('Download failed');
      }
      
      await MediaLibrary.saveToLibraryAsync(fileUri);
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      
      Alert.alert('Success', 'Image saved to gallery');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image');
      console.error('Save image error:', error);
    }
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    try {
      await Share.share({
        url: imageUrl,
        message: altText,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <ImageViewing
      images={imageData}
      imageIndex={0}
      visible={visible}
      onRequestClose={onRequestClose}
      FooterComponent={({ imageIndex }) => (
        <View className="flex-row justify-center items-center p-4 bg-black/50">
          <Button 
            onPress={handleSave} 
            className="mr-4"
            variant="secondary"
          >
            <SaveIcon/>
          </Button>
          <Button 
            onPress={handleShare}
            variant="secondary"
          >
            <ShareIcon/>
          </Button>
        </View>
      )}
    />
  );
};


