import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { Inventory2Page } from './pages/Inventory2Page';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import UIDemo from './pages/UIDemo';
import { SideSheetContext } from './components/Layout';

// Import CSS
import './index.css';

function App() {
  // Side sheet states
  const [isInventorySideSheetOpen, setInventorySideSheetOpen] = useState(false);
  const [isTransactionSideSheetOpen, setTransactionSideSheetOpen] = useState(false);

  // Context value for the SideSheetContext
  const sideSheetContextValue = {
    isInventorySideSheetOpen,
    setInventorySideSheetOpen,
    isTransactionSideSheetOpen,
    setTransactionSideSheetOpen,
  };

  return (
    <SideSheetContext.Provider value={sideSheetContextValue}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory2" element={<Inventory2Page />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ui-demo" element={<UIDemo />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </SideSheetContext.Provider>
  );
}

export default App;