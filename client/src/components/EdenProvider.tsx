import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EdenContext, type EdenStore } from "@/lib/store";
import { apiRequest } from "@/lib/queryClient";
import type { SavedItem, Collection, Concept, ChatMessage, UpdateSavedItem } from "@shared/schema";

export function EdenProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: items = [] } = useQuery<SavedItem[]>({
    queryKey: ["/api/items"],
    staleTime: 0,
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: concepts = [] } = useQuery<Concept[]>({
    queryKey: ["/api/concepts"],
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateSavedItem }) => {
      const response = await apiRequest("PATCH", `/api/items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/items/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
  });

  const addItem = useCallback((item: SavedItem) => {
    queryClient.invalidateQueries({ queryKey: ["/api/items"] });
  }, [queryClient]);

  const updateItem = useCallback((id: string, updates: Partial<SavedItem>) => {
    updateItemMutation.mutate({ id, updates });
  }, [updateItemMutation]);

  const deleteItem = useCallback((id: string) => {
    deleteItemMutation.mutate(id);
  }, [deleteItemMutation]);

  const setItems = useCallback((newItems: SavedItem[]) => {
    queryClient.setQueryData(["/api/items"], newItems);
  }, [queryClient]);

  const setCollections = useCallback((newCollections: Collection[]) => {
    queryClient.setQueryData(["/api/collections"], newCollections);
  }, [queryClient]);

  const setConcepts = useCallback((newConcepts: Concept[]) => {
    queryClient.setQueryData(["/api/concepts"], newConcepts);
  }, [queryClient]);

  const store: EdenStore = useMemo(
    () => ({
      items,
      collections,
      concepts,
      chatMessages,
      searchQuery,
      selectedIntent,
      selectedTags,
      isCapturing,
      selectedItem,
      isChatOpen,
      setItems,
      setCollections,
      setConcepts,
      setChatMessages,
      setSearchQuery,
      setSelectedIntent,
      setSelectedTags,
      setIsCapturing,
      setSelectedItem,
      setIsChatOpen,
      addItem,
      updateItem,
      deleteItem,
    }),
    [
      items,
      collections,
      concepts,
      chatMessages,
      searchQuery,
      selectedIntent,
      selectedTags,
      isCapturing,
      selectedItem,
      isChatOpen,
      setItems,
      setCollections,
      setConcepts,
      addItem,
      updateItem,
      deleteItem,
    ]
  );

  return <EdenContext.Provider value={store}>{children}</EdenContext.Provider>;
}
