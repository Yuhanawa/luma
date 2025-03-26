import type React from "react";
import { createContext, useContext, useState } from "react";
import { ImageViewer } from "../ui/image-viewer";

interface ImageViewerContextType {
	showImage: (imageUrl: string, altText?: string) => void;
}

const ImageViewerContext = createContext<ImageViewerContextType | null>(null);

export const ImageViewerProvider = ({ children }: { children: React.ReactNode }) => {
	const [visible, setVisible] = useState(false);
	const [imageUrl, setImageUrl] = useState<string>();
	const [altText, setAltText] = useState<string>();

	const showImage = (url: string, alt?: string) => {
		setImageUrl(url);
		setAltText(alt);
		setVisible(true);
	};

	return (
		<ImageViewerContext.Provider value={{ showImage }}>
			{children}
			<ImageViewer visible={visible} imageUrl={imageUrl} altText={altText} onRequestClose={() => setVisible(false)} />
		</ImageViewerContext.Provider>
	);
};

export const useImageViewer = () => {
	const context = useContext(ImageViewerContext);
	if (!context) {
		throw new Error("useImageViewer must be used within an ImageViewerProvider");
	}
	return context;
};
