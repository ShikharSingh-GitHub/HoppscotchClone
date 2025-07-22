import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUIStore = create(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarExpanded: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),

      // Theme state (for future implementation)
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),

      // Modals state
      showShortcutsModal: false,
      showFeedbackModal: false,
      setShowShortcutsModal: (show) => set({ showShortcutsModal: show }),
      setShowFeedbackModal: (show) => set({ showFeedbackModal: show }),
      toggleShortcutsModal: () =>
        set((state) => ({
          showShortcutsModal: !state.showShortcutsModal,
        })),
      toggleFeedbackModal: () =>
        set((state) => ({
          showFeedbackModal: !state.showFeedbackModal,
        })),

      // Layout preferences
      layoutMode: "horizontal", // 'horizontal' | 'vertical'
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      toggleLayoutMode: () =>
        set((state) => ({
          layoutMode:
            state.layoutMode === "horizontal" ? "vertical" : "horizontal",
        })),
    }),
    {
      name: "hoppscotch-ui-store",
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        theme: state.theme,
        layoutMode: state.layoutMode,
      }),
    }
  )
);

export default useUIStore;
