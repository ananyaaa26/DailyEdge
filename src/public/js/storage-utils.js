// Storage Utility Manager for DailyEdge
// Handles localStorage (permanent) and sessionStorage (temporary)

// ============================================
// LOCAL STORAGE - Permanent Preferences
// ============================================
const Preferences = {
    // Dashboard view mode (grid or list)
    dashboardView: {
        get: () => localStorage.getItem('dashboardView') || 'grid',
        set: (view) => {
            if (view === 'grid' || view === 'list') {
                localStorage.setItem('dashboardView', view);
                console.log('Dashboard view saved:', view);
            }
        }
    }
};

// ============================================
// SESSION STORAGE - Temporary UI State
// ============================================
const UIState = {
    // Form draft auto-save
    formDraft: {
        get: (formName) => {
            const draft = sessionStorage.getItem(`draft_${formName}`);
            return draft ? JSON.parse(draft) : null;
        },
        set: (formName, data) => {
            sessionStorage.setItem(`draft_${formName}`, JSON.stringify(data));
        },
        clear: (formName) => {
            sessionStorage.removeItem(`draft_${formName}`);
        }
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const StorageUtils = {
    // Get storage size
    getStorageSize: () => {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    },
    
    // Clear all app storage (useful for logout)
    clearAll: () => {
        const confirmed = confirm('Clear all saved preferences and drafts?');
        if (confirmed) {
            localStorage.clear();
            sessionStorage.clear();
            console.log('All storage cleared');
        }
    },
    
    // Debug: Show all stored data
    debugStorage: () => {
        console.group('Local Storage (Permanent)');
        console.log('Dashboard View:', Preferences.dashboardView.get());
        console.log('Welcome Seen:', Preferences.welcomeSeen.get());
        console.groupEnd();
        
        console.group('Session Storage (Temporary)');
        console.log('Form Draft:', sessionStorage.getItem('draft_habitForm') ? 'Saved' : 'None');
        console.log('Total Size:', StorageUtils.getStorageSize());
        console.groupEnd();
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Preferences, UIState, StorageUtils };
}
