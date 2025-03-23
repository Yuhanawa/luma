import { useColorScheme } from "nativewind";
import {
  Linking,
  Pressable,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import RenderHtml, {
  type MixedStyleDeclaration,
  type RenderHTMLProps,
  type TagName,
  HTMLElementModel,
  HTMLContentModel,
  CustomBlockRenderer,
  TChildrenRenderer,
  CustomRendererProps,
  TBlock,
} from "react-native-render-html";
import { cn } from "~/lib/utils";
import { Image as ExpoImage } from "expo-image";
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Polygon,
  Polyline,
  Line,
  Rect,
  Text as SVGText,
} from "react-native-svg";
import { useMemo, memo, useEffect } from "react";
import { useImageViewer } from "./image-viewer-context";

export interface HTMLContentProps extends Partial<RenderHTMLProps> {
  html: string;
  contentClassName?: string;
  contentStyle?: ViewStyle;
  baseSize?: number;
  systemFonts?: string[];
  customStyles?: Partial<Record<TagName, MixedStyleDeclaration>>;
  onImagePress?: (uri: string) => void;
}

const SVGRenderer: CustomBlockRenderer = ({ tnode }) => {
  const { width, height, viewBox, ...otherAttrs } = tnode.attributes;
  const svgWidth = width ? parseInt(width) : 24;
  const svgHeight = height ? parseInt(height) : 24;
  const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = (
    viewBox || `0 0 ${svgWidth} ${svgHeight}`
  )
    .split(" ")
    .map(Number);

  const renderSVGElement = (node: any) => {
    const attrs = node.attributes || {};

    switch (node.tagName) {
      case "path":
        return (
          <Path
            key={node.key}
            d={attrs.d}
            fill={attrs.fill}
            stroke={attrs.stroke}
          />
        );
      case "circle":
        return (
          <Circle
            key={node.key}
            cx={attrs.cx}
            cy={attrs.cy}
            r={attrs.r}
            fill={attrs.fill}
            stroke={attrs.stroke}
          />
        );
      case "rect":
        return (
          <Rect
            key={node.key}
            x={attrs.x}
            y={attrs.y}
            width={attrs.width}
            height={attrs.height}
            fill={attrs.fill}
            stroke={attrs.stroke}
          />
        );
      case "line":
        return (
          <Line
            key={node.key}
            x1={attrs.x1}
            y1={attrs.y1}
            x2={attrs.x2}
            y2={attrs.y2}
            stroke={attrs.stroke}
          />
        );
      case "polyline":
        return (
          <Polyline
            key={node.key}
            points={attrs.points}
            fill={attrs.fill}
            stroke={attrs.stroke}
          />
        );
      case "polygon":
        return (
          <Polygon
            key={node.key}
            points={attrs.points}
            fill={attrs.fill}
            stroke={attrs.stroke}
          />
        );
      case "g":
        return (
          <G key={node.key} {...attrs}>
            {node.children?.map((child: any) => renderSVGElement(child))}
          </G>
        );
      case "text":
        return (
          <SVGText key={node.key} {...attrs}>
            {node.children?.[0]?.data}
          </SVGText>
        );
      default:
        return null;
    }
  };

  return (
    <Svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
      {...otherAttrs}
    >
      {tnode.children?.map((child: any) => renderSVGElement(child))}
    </Svg>
  );
};

const customHTMLElementModels = {
  svg: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "svg",
    renderer: SVGRenderer,
  } as any),
  path: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "path",
    mixedUAStyles: {},
  }),
  circle: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "circle",
    mixedUAStyles: {},
  }),
  rect: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "rect",
    mixedUAStyles: {},
  }),
  line: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "line",
    mixedUAStyles: {},
  }),
  polyline: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "polyline",
    mixedUAStyles: {},
  }),
  polygon: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "polygon",
    mixedUAStyles: {},
  }),
  g: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "g",
    mixedUAStyles: {},
  }),
  text: HTMLElementModel.fromCustomModel({
    contentModel: HTMLContentModel.block,
    tagName: "text",
    mixedUAStyles: {},
  }),
};

const ImageRenderer: CustomBlockRenderer = ({
  tnode,
  onImagePress,
}: CustomRendererProps<TBlock> & {
  onImagePress?: (src: string, alt?: string) => void;
}) => {
  const { src, alt, width, height } = tnode.attributes;
  const { width: screenWidth } = useWindowDimensions();
  const maxWidth = screenWidth - 32;

  const imageSize = useMemo(() => {
    if (!src) return null;

    const w = width ? parseInt(width) : maxWidth;
    const h = height ? parseInt(height) : undefined;

    if (w && h) {
      const ratio = w / h;
      const finalWidth = Math.min(w, maxWidth);
      return {
        width: finalWidth,
        height: finalWidth / ratio,
      };
    }

    return {
      width: maxWidth,
      height: undefined,
      aspectRatio: 16 / 9,
    };
  }, [width, height, maxWidth, src]);

  if (!src || !imageSize) return null;

  return (
    <Pressable onPress={() => onImagePress?.(src, alt)} className="my-2">
      <ExpoImage
        source={{ uri: src }}
        alt={alt}
        style={imageSize}
        contentFit="contain"
        transition={300}
        className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
        cachePolicy="memory-disk"
      />
    </Pressable>
  );
};

ImageRenderer.displayName = "ImageRenderer";

export const useHTMLStyles = (
  baseSize = 16,
  customStyles: Partial<Record<TagName, MixedStyleDeclaration>> = {}
) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const defaultStyles: Partial<Record<TagName, MixedStyleDeclaration>> = {
    body: {
      color: isDark ? "#E5E7EB" : "#374151",
      fontSize: baseSize,
      lineHeight: baseSize * 1.5,
    },
    p: {
      marginVertical: baseSize * 0.5,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    img: {
      display: "flex",
      marginHorizontal: 2,
    },
    a: {
      color: isDark ? "#60A5FA" : "#2563EB",
      textDecorationLine: "none",
    },
    strong: {
      fontWeight: "bold",
    },
    em: {
      fontStyle: "italic",
    },
    pre: {
      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
      padding: baseSize * 0.75,
      borderRadius: 6,
      marginVertical: baseSize * 0.5,
      overflow: "visible",
    },
    code: {
      fontFamily: "monospace",
      fontSize: baseSize * 0.875,
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    blockquote: {
      borderLeftWidth: 2,
      borderLeftColor: isDark ? "#4B5563" : "#D1D5DB",
      paddingLeft: baseSize * 0.75,
      marginVertical: baseSize * 0.5,
      fontStyle: "italic",
    },
    ul: {
      marginVertical: baseSize * 0.5,
      paddingLeft: baseSize,
    },
    ol: {
      marginVertical: baseSize * 0.5,
      paddingLeft: baseSize,
    },
    li: {
      marginVertical: baseSize * 0.25,
    },
    h1: {
      fontSize: baseSize * 2,
      fontWeight: "bold",
      marginVertical: baseSize,
      color: isDark ? "#F9FAFB" : "#111827",
    },
    h2: {
      fontSize: baseSize * 1.5,
      fontWeight: "bold",
      marginVertical: baseSize * 0.75,
      color: isDark ? "#F9FAFB" : "#111827",
    },
    h3: {
      fontSize: baseSize * 1.25,
      fontWeight: "bold",
      marginVertical: baseSize * 0.5,
      color: isDark ? "#F9FAFB" : "#111827",
    },
    h4: {
      fontSize: baseSize * 1.125,
      fontWeight: "bold",
      marginVertical: baseSize * 0.5,
      color: isDark ? "#F9FAFB" : "#111827",
    },
    table: {
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
      marginVertical: baseSize * 0.5,
    },
    th: {
      backgroundColor: isDark ? "#374151" : "#F3F4F6",
      padding: baseSize * 0.5,
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
    },
    td: {
      padding: baseSize * 0.5,
      borderWidth: 1,
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
    },
  };

  return {
    tagsStyles: {
      ...defaultStyles,
      ...customStyles,
    },
    renderConfig: {
      enableExperimentalMarginCollapsing: true,
      enableExperimentalGhostLinesPrevention: true,
    },
  };
};

export const HTMLContent = memo(
  ({
    html,
    contentClassName = "",
    contentStyle = {},
    baseSize = 16,
    systemFonts = [],
    customStyles = {},
    ...props
  }: HTMLContentProps) => {
    const { width } = useWindowDimensions();
    const { tagsStyles, renderConfig } = useHTMLStyles(baseSize, customStyles);
    const { showImage } = useImageViewer();

    const cleanHtml = useMemo(
      () =>
        html
          .replace(/(\r\n|\n|\r)/gm, "")
          .replace(/\s+/g, " ")
          .trim(),
      [html]
    );

    // pre fetch images
    useEffect(() => {
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      const matches = [...cleanHtml.matchAll(imgRegex)];
      const imageUrls = matches.map((match) => match[1]);

      if (imageUrls.length > 0) {
        ExpoImage.prefetch(imageUrls);
      }
    }, [cleanHtml]);

    const renderers = useMemo(
      () => ({
        img: (props: any) =>
          ImageRenderer({
            ...props,
            onImagePress: (src: string, alt?: string) => showImage(src, alt),
          }),
        svg: SVGRenderer,
      }),
      [showImage]
    );

    return (
      <View
        className={cn("web:select-text", contentClassName)}
        style={contentStyle}
      >
        <RenderHtml
          contentWidth={width - 32}
          source={{ html: cleanHtml }}
          tagsStyles={tagsStyles}
          systemFonts={systemFonts}
          customHTMLElementModels={customHTMLElementModels}
          renderers={renderers}
          defaultTextProps={{
            selectable: true,
          }}
          renderersProps={{
            a: {
              onPress: (href) => {
                if (typeof href === "string") {
                  Linking.openURL(href);
                }
              },
            },
          }}
          enableExperimentalBRCollapsing
          {...renderConfig}
          {...props}
        />
      </View>
    );
  }
);

HTMLContent.displayName = "HTMLContent";
