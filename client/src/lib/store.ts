import { createContext, useContext } from "react";
import type { SavedItem, Collection, Concept, ChatMessage, UpdateSavedItem } from "@shared/schema";

export interface EdenStore {
  items: SavedItem[];
  collections: Collection[];
  concepts: Concept[];
  chatMessages: ChatMessage[];
  searchQuery: string;
  selectedIntent: string | null;
  selectedTags: string[];
  isCapturing: boolean;
  isBatchImporting: boolean;
  isFileUploading: boolean;
  selectedItem: SavedItem | null;
  isChatOpen: boolean;
  setItems: (items: SavedItem[]) => void;
  setCollections: (collections: Collection[]) => void;
  setConcepts: (concepts: Concept[]) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedIntent: (intent: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setIsCapturing: (capturing: boolean) => void;
  setIsBatchImporting: (importing: boolean) => void;
  setIsFileUploading: (uploading: boolean) => void;
  setSelectedItem: (item: SavedItem | null) => void;
  setIsChatOpen: (open: boolean) => void;
  addItem: (item: SavedItem) => void;
  updateItem: (id: string, updates: UpdateSavedItem) => void;
  deleteItem: (id: string) => void;
}

export const EdenContext = createContext<EdenStore | null>(null);

export function useEden() {
  const context = useContext(EdenContext);
  if (!context) {
    throw new Error("useEden must be used within an EdenProvider");
  }
  return context;
}
