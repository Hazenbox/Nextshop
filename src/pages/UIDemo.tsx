import React, { useState, useContext } from 'react';
import { Layout, SideSheetContext } from '../components/Layout';

// Demo components for side sheets
const InventoryForm = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Add Inventory Item</h2>
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Item Name</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-md" 
          placeholder="Enter item name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          className="w-full p-2 border rounded-md" 
          placeholder="Enter description"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input 
          type="number" 
          className="w-full p-2 border rounded-md" 
          placeholder="0.00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input 
          type="number" 
          className="w-full p-2 border rounded-md" 
          placeholder="0"
        />
      </div>
      <button 
        type="button" 
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Add Item
      </button>
    </form>
  </div>
);

const TransactionForm = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Add Transaction</h2>
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Customer Name</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded-md" 
          placeholder="Enter customer name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Product</label>
        <select className="w-full p-2 border rounded-md">
          <option>Select product</option>
          <option>Product 1</option>
          <option>Product 2</option>
          <option>Product 3</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input 
          type="number" 
          className="w-full p-2 border rounded-md" 
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <input 
          type="number" 
          className="w-full p-2 border rounded-md" 
          placeholder="0.00"
        />
      </div>
      <button 
        type="button" 
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
      >
        Add Transaction
      </button>
    </form>
  </div>
);

export const UIDemo = () => {
  const [activeSection, setActiveSection] = useState('navigation');
  const { 
    isInventorySideSheetOpen, 
    setInventorySideSheetOpen,
    isTransactionSideSheetOpen, 
    setTransactionSideSheetOpen 
  } = useContext(SideSheetContext);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">UI Component Demo</h1>
        
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setActiveSection('navigation')}
              className={`px-4 py-2 rounded-md ${activeSection === 'navigation' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Navigation
            </button>
            <button 
              onClick={() => setActiveSection('side-sheets')}
              className={`px-4 py-2 rounded-md ${activeSection === 'side-sheets' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Side Sheets
            </button>
          </div>
          
          {activeSection === 'navigation' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Navigation Components</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Navigation Rail</h3>
                  <p className="text-gray-600 mb-2">
                    The navigation rail is shown on desktop and provides access to main app sections. 
                    Try resizing your browser window to see how it responds.
                  </p>
                  <ul className="list-disc pl-5 text-gray-600">
                    <li>Collapsible for more screen space</li>
                    <li>Shows icons and labels when expanded</li>
                    <li>Shows only icons when collapsed</li>
                    <li>Includes a FAB button at the top</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Bottom Navigation</h3>
                  <p className="text-gray-600 mb-2">
                    On mobile devices, the navigation switches to a bottom bar.
                    Resize your browser window to mobile width to see it in action.
                  </p>
                  <ul className="list-disc pl-5 text-gray-600">
                    <li>Fixed at the bottom of the screen</li>
                    <li>Shows only essential navigation items</li>
                    <li>Includes a centered FAB button</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'side-sheets' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Side Sheets</h2>
              <p className="text-gray-600 mb-4">
                Side sheets replace traditional modals for better mobile experience.
                Click the buttons below to see them in action.
              </p>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    setTransactionSideSheetOpen(false);
                    setInventorySideSheetOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Show Inventory Form
                </button>
                <button 
                  onClick={() => {
                    setInventorySideSheetOpen(false);
                    setTransactionSideSheetOpen(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Show Transaction Form
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Try collapsing and expanding the navigation rail by clicking the toggle icon</li>
            <li>Resize your browser to see the responsive behavior</li>
            <li>Click the FAB button to see the side sheet appear</li>
            <li>Try both demo forms from the "Side Sheets" section</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
};

export default UIDemo; 