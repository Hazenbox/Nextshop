import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { inventoryStorage, mockInventoryItems } from '../lib/inventory';
import { AddInventorySideSheet } from '../components/AddInventorySideSheet';
import { InventoryItem } from '../types';
import { nanoid } from 'nanoid';
import { useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import MobileStepper from '@mui/material/MobileStepper';
import SwipeableViews from 'react-swipeable-views';
import { Close } from '@mui/icons-material';

// Icons
import { 
  Search, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add,
  FileDownload, 
  Star as StarIcon, 
  StarBorder as StarBorderIcon,
  Inventory,
  Warning,
  RemoveShoppingCart,
  MonetizationOn,
  Dashboard,
  ShoppingCart,
  People,
  Settings,
  Notifications,
  Person,
  Visibility as VisibilityIcon,
  WarningAmber as WarningAmberIcon,
  BarChart as BarChartIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  PhotoLibrary as PhotoLibraryIcon,
  VideoLibrary as VideoLibraryIcon,
} from '@mui/icons-material';
import { BarChart4 } from 'lucide-react';

// Drawer width for the left navigation
const DRAWER_WIDTH = 280;

// Safely get theme color with fallback
const getThemeColor = (theme: any, colorPath: string, fallback: string): string => {
  try {
    // Split the path into parts (e.g., "palette.primaryContainer.main" => ["palette", "primaryContainer", "main"])
    const parts = colorPath.split('.');
    let result = theme;
    
    // Navigate through the theme object
    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        return fallback;
      }
    }
    
    return typeof result === 'string' ? result : fallback;
  } catch (error) {
    console.warn(`Error accessing theme color ${colorPath}:`, error);
    return fallback;
  }
};

// Helper function to format currency values
const formatCurrency = (value: number, currency?: string): string => {
  const currencySymbol = 
    currency === 'INR' ? '₹' : 
    currency === 'USD' ? '$' : 
    currency === 'EUR' ? '€' : 
    currency === 'GBP' ? '£' : 
    currency === 'JPY' ? '¥' : '$';
  
  // Different formatting for different currencies
  if (currency === 'JPY') {
    return `${currencySymbol}${Math.round(value).toLocaleString()}`; // No decimals for Yen
  }
  
  return `${currencySymbol}${value.toFixed(2).toLocaleString()}`;
};

export function InventoryPage() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Calculate summary stats for cards
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.status === 'low stock').length;
  const outOfStockItems = inventoryItems.filter(item => item.status === 'out of stock').length;
  const activeItems = inventoryItems.filter(item => item.status === 'active').length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    const loadInventoryItems = () => {
      setLoading(true);
      try {
        const items = inventoryStorage.getAllItems();
        if (items && items.length > 0) {
          setInventoryItems(items);
        } else {
          setInventoryItems(mockInventoryItems);
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
        setInventoryItems(mockInventoryItems);
      } finally {
        setLoading(false);
      }
    };

    loadInventoryItems();
  }, []);

  const handleAddItem = (item: InventoryItem) => {
    const newItems = [...inventoryItems, item];
    setInventoryItems(newItems);
    try {
      inventoryStorage.addItem(item);
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    const newItems = inventoryItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setInventoryItems(newItems);
    try {
      inventoryStorage.updateItem(updatedItem.id, updatedItem);
    } catch (error) {
      console.error('Error saving updated items:', error);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const newItems = inventoryItems.filter(item => item.id !== id);
      setInventoryItems(newItems);
      try {
        inventoryStorage.deleteItem(id);
      } catch (error) {
        console.error('Error saving after delete:', error);
      }
    }
  };

  const handleExport = () => {
    try {
      const headers = ['Name', 'Description', 'Category', 'Price', 'Cost', 'Quantity', 'Status', 'Added'];
      const csvContent = [
        headers.join(','),
        ...inventoryItems.map(item => {
          const row = [
            `"${item.name}"`,
            `"${item.description || ''}"`,
            `"${item.category}"`,
            item.price,
            item.cost_price,
            item.quantity,
            `"${item.status}"`,
            `"${new Date(item.created_at).toLocaleDateString()}"`
          ];
          return row.join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting inventory:', error);
      alert('Failed to export inventory data');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const handleSideSheetClose = () => {
    setIsSideSheetOpen(false);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter and sort items
  const filteredItems = inventoryItems
    .filter(item => {
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) || 
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          item.category.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Render icon based on status
  const renderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <VisibilityIcon fontSize="small" />;
      case 'low stock':
        return <WarningAmberIcon fontSize="small" />;
      case 'out of stock':
        return <RemoveShoppingCart fontSize="small" />;
      default:
        return null;
    }
  };

  // Get status chip color based on item status
  const getStatusChipProps = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          color: 'success' as const,
          variant: 'filled' as const
        };
      case 'reserved':
        return {
          color: 'info' as const,
          variant: 'filled' as const
        };
      case 'low stock':
        return {
          color: 'warning' as const,
          variant: 'filled' as const
        };
      case 'out of stock':
        return {
          color: 'error' as const,
          variant: 'filled' as const
        };
      case 'sold':
        return {
          color: 'default' as const,
          variant: 'outlined' as const
        };
      default:
        return {
          color: 'default' as const,
          variant: 'outlined' as const
        };
    }
  };

  // Function to get icon based on status for navigation
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'all': return <Inventory />;
      case 'low stock': return <WarningAmberIcon />;
      case 'out of stock': return <RemoveShoppingCart />;
      case 'active': return <VisibilityIcon />;
      default: return <Inventory />;
    }
  };

  // Navigation list items based on status filters
  const navigationItems = [
    { status: 'all', label: 'All Items', count: totalItems },
    { status: 'low stock', label: 'Low Stock', count: lowStockItems },
    { status: 'out of stock', label: 'Out of Stock', count: outOfStockItems },
    { status: 'active', label: 'Active Items', count: activeItems }
  ];

  // Material Design 3 colors with fallbacks
  const primaryColor = getThemeColor(theme, 'palette.primary.main', '#6750A4');
  const onPrimaryColor = getThemeColor(theme, 'palette.onPrimary.main', '#FFFFFF');
  const primaryContainerColor = getThemeColor(theme, 'palette.primaryContainer.main', '#E8DEF8');
  const onPrimaryContainerColor = getThemeColor(theme, 'palette.onPrimaryContainer.main', '#1D192B');
  
  const secondaryColor = getThemeColor(theme, 'palette.secondary.main', '#625B71');
  const onSecondaryColor = getThemeColor(theme, 'palette.secondary.contrastText', '#FFFFFF');
  const secondaryContainerColor = getThemeColor(theme, 'palette.secondary.light', '#E8DEF8');
  const onSecondaryContainerColor = getThemeColor(theme, 'palette.secondary.dark', '#1E192B');
  
  const errorColor = getThemeColor(theme, 'palette.error.main', '#B3261E');
  const onErrorColor = getThemeColor(theme, 'palette.error.contrastText', '#FFFFFF');
  const errorContainerColor = getThemeColor(theme, 'palette.error.light', '#F9DEDC');
  const onErrorContainerColor = getThemeColor(theme, 'palette.error.dark', '#410E0B');
  
  const warningColor = getThemeColor(theme, 'palette.warning.main', '#F57C00');
  const onWarningColor = getThemeColor(theme, 'palette.warning.contrastText', '#FFFFFF');
  const warningContainerColor = getThemeColor(theme, 'palette.warning.light', '#FFEAD6');
  const onWarningContainerColor = getThemeColor(theme, 'palette.warning.dark', '#7A2E00');
  
  const surfaceColor = getThemeColor(theme, 'palette.background.paper', '#FFFBFE');
  const onSurfaceColor = getThemeColor(theme, 'palette.text.primary', '#1C1B1F');
  const onSurfaceVariantColor = getThemeColor(theme, 'palette.text.secondary', '#49454F');
  const surfaceVariantColor = getThemeColor(theme, 'palette.action.hover', '#E7E0EC');
  const surfaceContainerLowColor = getThemeColor(theme, 'palette.action.hover', '#F7F2FA');
  const surfaceContainerLowestColor = getThemeColor(theme, 'palette.background.default', '#FFFBFF');
  const surfaceContainerHighColor = getThemeColor(theme, 'palette.action.selected', '#ECE6F0');
  
  const outlineColor = getThemeColor(theme, 'palette.divider', '#79747E');
  const outlineVariantColor = getThemeColor(theme, 'palette.action.disabledBackground', '#E7E0EC');
  
  // Material Design 3 style variables
  const md3BorderRadius = 16;
  const md3CardBorderRadius = 24;
  const md3ButtonBorderRadius = 20;
  const md3ChipBorderRadius = 12;
  const md3CardElevation = '0px 1px 3px 0px rgba(0,0,0,0.12), 0px 1px 2px 0px rgba(0,0,0,0.24)';
  
  // Summary cards data
  const summaryCards = [
    {
      title: 'Total Items',
      value: totalItems,
      icon: <Inventory />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1)
    },
    {
      title: 'Low Stock',
      value: lowStockItems,
      icon: <WarningAmberIcon />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1)
    },
    {
      title: 'Out of Stock',
      value: outOfStockItems,
      icon: <RemoveShoppingCart />,
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.1)
    },
    {
      title: 'Total Value',
      value: `₹${totalValue.toLocaleString()}`,
      icon: <BarChartIcon />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1)
    }
  ];

  // Handle viewing an item detail
  const handleViewItem = (item: InventoryItem) => {
    setViewItem(item);
    setActiveStep(0);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewItem(null);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  return (
    <Layout>
      <Box sx={{ 
        display: 'flex', 
        backgroundColor: '#fff',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        {/* Main Content - Simplified */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            width: '100%'
          }}
        >
          {/* Page Title */}
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'var(--md-on-surface)',
              fontWeight: 500,
              mb: 4,
              mt: 2,
              fontSize: '1.75rem',
              className: 'md-headline-medium'
            }}
          >
            Inventory
          </Typography>
          
          {/* Search and Filter Row */}
          <Box sx={{ 
            mb: 4, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <Box sx={{ flex: 1 }}></Box> {/* Spacer */}
            <Stack 
              direction="row" 
              spacing={2} 
              alignItems="center"
            >
              <TextField
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 28,
                    backgroundColor: '#f1f3f4',
                    fontSize: '0.95rem',
                    height: 40,
                    '&:hover': {
                      backgroundColor: '#e8eaed'
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 2px 0 rgba(60,64,67,.3)'
                    },
                    '& fieldset': {
                      border: 'none'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#5f6368', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    fontSize: '0.95rem',
                    height: 40,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dadce0'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dadce0'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem'
                  }
                }}
              >
                <InputLabel id="status-filter-label" sx={{ color: '#5f6368' }}>
                  Status
                </InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="low stock">Low Stock</MenuItem>
                  <MenuItem value="out of stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                aria-label="download csv"
                onClick={handleExport}
                startIcon={<FileDownload sx={{ fontSize: 18 }} />}
                variant="outlined"
                size="small"
                sx={{
                  border: '1px solid #dadce0',
                  borderRadius: 4,
                  padding: '6px 12px',
                  color: '#5f6368',
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  height: 40
                }}
              >
                .CSV
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setIsSideSheetOpen(true)}
                sx={{
                  bgcolor: theme => theme.palette.primary.main,
                  color: '#fff',
                  borderRadius: 28,
                  height: 40,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  fontSize: '0.95rem',
                  '&:hover': {
                    bgcolor: theme => theme.palette.primary.dark
                  }
                }}
              >
                Add Item
              </Button>
            </Stack>
          </Box>
          
          {/* Inventory Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Inventory Table */}
              <Paper 
                elevation={0}
                sx={{ 
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: '1px solid #dadce0'
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell padding="checkbox" sx={{ py: 1.5 }}>
                          <Checkbox
                            color="primary"
                            indeterminate={false}
                            checked={false}
                            onChange={() => {}}
                            sx={{ 
                              color: '#5f6368',
                              '&.Mui-checked': {
                                color: theme.palette.primary.main,
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          ID
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5,
                            width: 80
                          }}
                        >
                          IMAGE
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          ITEM INFO
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          CATEGORY
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          LABEL
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          PURCHASED AT
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          LISTED AT
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          PROFIT
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          QTY
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            fontWeight: 500,
                            color: '#5f6368',
                            fontSize: '0.8rem',
                            letterSpacing: '0.07em',
                            py: 1.5
                          }}
                        >
                          ACTIONS
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.map((item) => {
                        // Avatar color based on material design palette
                        const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const avatarColors = ['#ea4335', '#4285f4', '#fbbc04', '#34a853', '#3A9E00'];
                        const avatarColor = avatarColors[hash % avatarColors.length];
                        
                        // Status styling based on actual item status
                        let statusConfig;
                        
                        switch(item.status) {
                          case 'active':
                            statusConfig = {
                              label: 'Active',
                              color: '#1e8e3e',
                              bgColor: '#e6f4ea'
                            };
                            break;
                          case 'low stock':
                            statusConfig = {
                              label: 'Low Stock',
                              color: '#f29900',
                              bgColor: '#fef7e0'
                            };
                            break;
                          case 'out of stock':
                            statusConfig = {
                              label: 'Out of Stock',
                              color: '#d93025',
                              bgColor: '#fce8e6'
                            };
                            break;
                          default:
                            statusConfig = {
                              label: item.status,
                              color: theme.palette.primary.main,
                              bgColor: alpha(theme.palette.primary.main, 0.1)
                            };
                        }
                        
                        return (
                          <TableRow 
                            key={item.id}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: '#f8f9fa' 
                              },
                              borderBottom: '1px solid #e8eaed'
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={false}
                                onChange={() => {}}
                                sx={{ 
                                  color: '#dadce0',
                                  '&.Mui-checked': {
                                    color: theme.palette.primary.main,
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.875rem', color: '#202124' }}>
                              {item.id.slice(0, 5)}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ position: 'relative', width: 50, height: 50 }}>
                                {item.image ? (
                                  <>
                                    <Box
                                      component="img"
                                      src={item.image}
                                      alt={item.name}
                                      sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 1,
                                        objectFit: 'cover',
                                        border: '1px solid #e0e0e0',
                                        transition: 'transform 0.2s ease',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: 1,
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }
                                      }}
                                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        // Hide the image on error and show the fallback
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    {/* Hidden fallback that will be visible if the image fails to load */}
                                    <Box
                                      className="image-fallback"
                                      sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 1,
                                        bgcolor: (theme) => theme.palette.primary.main,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 500,
                                        fontSize: '1.2rem',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: 0
                                      }}
                                    >
                                      {item.name.charAt(0).toUpperCase()}
                                    </Box>
                                  </>
                                ) : (
                                  <Box
                                    className="image-fallback"
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      borderRadius: 1,
                                      bgcolor: (theme) => theme.palette.primary.main,
                                      color: '#fff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 500,
                                      fontSize: '1.2rem'
                                    }}
                                  >
                                    {item.name.charAt(0).toUpperCase()}
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontWeight: 500, 
                                    fontSize: '0.95rem',
                                    color: '#202124',
                                    lineHeight: 1.4
                                  }}
                                >
                                  {item.name}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#5f6368',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '200px'
                                  }}
                                >
                                  {item.description || 'No description available'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.95rem', color: '#202124' }}>
                              {item.category}
                            </TableCell>
                            <TableCell>
                              {/* Mock label since it's not in the current data model */}
                              <Chip 
                                label={item.category.toLowerCase() === 'electronics' ? 'Tech' : 
                                       item.category.toLowerCase() === 'clothing' ? 'Apparel' : 
                                       'General'}
                                size="small"
                                sx={{ 
                                  borderRadius: 1,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontSize: '0.8rem',
                                  height: 26
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.95rem', color: '#202124' }}>
                              {formatCurrency(item.cost_price, item.currency)}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.95rem', color: '#202124' }}>
                              {formatCurrency(item.price, item.currency)}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.95rem' }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: item.price - item.cost_price > 0 ? '#1e8e3e' : '#d93025',
                                  fontWeight: 500,
                                  fontSize: '0.95rem'
                                }}
                              >
                                {formatCurrency(item.price - item.cost_price, item.currency)}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    ml: 0.5,
                                    color: item.price - item.cost_price > 0 ? '#2e9e43' : '#e53935',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    opacity: 0.9
                                  }}
                                >
                                  ({item.price > 0 ? ((item.price - item.cost_price) / item.price * 100).toFixed(0) : 0}%)
                                </Typography>
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.95rem' }}>
                              <Box 
                                component="span" 
                                sx={{ 
                                  color: item.quantity <= 0 ? '#d93025' : item.quantity <= 10 ? '#f29900' : '#1e8e3e',
                                  fontWeight: 500
                                }}
                              >
                                {item.quantity}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <IconButton 
                                  size="small"
                                  sx={{ 
                                    color: '#5f6368',
                                    '&:hover': {
                                      backgroundColor: '#f1f3f4',
                                      color: theme.palette.primary.main
                                    }
                                  }}
                                  onClick={() => handleViewItem(item)}
                                >
                                  <VisibilityIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                <IconButton 
                                  size="small"
                                  onClick={() => handleEdit(item)}
                                  sx={{ 
                                    color: '#5f6368',
                                    '&:hover': {
                                      backgroundColor: '#f1f3f4',
                                      color: theme.palette.primary.main
                                    }
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDeleteItem(item.id)}
                                  sx={{ 
                                    color: '#5f6368',
                                    '&:hover': {
                                      backgroundColor: '#f1f3f4',
                                      color: '#d93025'
                                    }
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              
              {/* Pagination */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center',
                  mt: 2,
                  color: '#5f6368', 
                  fontSize: '0.875rem'
                }}
              >
                <Typography variant="body2" sx={{ mr: 2, color: '#5f6368' }}>
                  {filteredItems.length} items
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    disabled={true}
                    sx={{ 
                      color: '#5f6368',
                      '&.Mui-disabled': {
                        color: '#dadce0'
                      }
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
                    </svg>
                  </IconButton>
                  <Typography sx={{ mx: 1, color: '#202124' }}>1</Typography>
                  <IconButton 
                    disabled={true}
                    sx={{ 
                      color: '#5f6368',
                      '&.Mui-disabled': {
                        color: '#dadce0'
                      }
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill="currentColor"/>
                    </svg>
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
          
          {/* View Item Detail Modal */}
          <Dialog
            open={isViewModalOpen}
            onClose={handleViewModalClose}
            PaperProps={{
              sx: {
                borderRadius: 8,
                backgroundColor: '#fff',
                boxShadow: '0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.12), 0px 4px 5px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden'
              }
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle 
              sx={{ 
                color: '#202124',
                borderBottom: '1px solid #e0e0e0',
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {viewItem?.name}
              </Typography>
              <IconButton 
                onClick={handleViewModalClose}
                size="small"
                sx={{ 
                  color: theme.palette.text.secondary,
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              {viewItem && (
                <>
                  {/* Media Carousel */}
                  <Box sx={{ position: 'relative', width: '100%', bgcolor: '#f7f7f7' }}>
                    {viewItem.media && viewItem.media.length > 0 ? (
                      <>
                        <SwipeableViews
                          axis="x"
                          index={activeStep}
                          onChangeIndex={handleStepChange}
                          enableMouseEvents
                        >
                          {viewItem.media.map((media, index) => (
                            <Box key={index} sx={{ height: 300, position: 'relative' }}>
                              {media.type === 'image' ? (
                                <Box
                                  component="img"
                                  src={media.url}
                                  alt={`${viewItem.name} - media ${index + 1}`}
                                  sx={{
                                    width: '100%',
                                    height: 300,
                                    objectFit: 'contain',
                                    display: 'block',
                                  }}
                                />
                              ) : (
                                <Box
                                  component="video"
                                  src={media.url}
                                  controls
                                  sx={{
                                    width: '100%',
                                    height: 300,
                                    objectFit: 'contain',
                                    display: 'block',
                                  }}
                                />
                              )}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  color: '#fff',
                                  padding: '6px 16px',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                {media.type === 'image' ? (
                                  <PhotoLibraryIcon fontSize="small" />
                                ) : (
                                  <VideoLibraryIcon fontSize="small" />
                                )}
                                <Typography variant="caption">
                                  {media.type === 'image' ? 'Image' : 'Video'} {index + 1} of {viewItem?.media?.length || 0}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </SwipeableViews>
                        <MobileStepper
                          steps={viewItem?.media?.length || 0}
                          position="static"
                          activeStep={activeStep}
                          sx={{ 
                            bgcolor: 'transparent',
                          }}
                          nextButton={
                            <Button
                              size="small"
                              onClick={handleNext}
                              disabled={activeStep === (viewItem?.media?.length || 0) - 1}
                            >
                              Next
                              <KeyboardArrowRight />
                            </Button>
                          }
                          backButton={
                            <Button
                              size="small"
                              onClick={handleBack}
                              disabled={activeStep === 0}
                            >
                              <KeyboardArrowLeft />
                              Back
                            </Button>
                          }
                        />
                      </>
                    ) : viewItem.image ? (
                      <Box
                        component="img"
                        src={viewItem.image}
                        alt={viewItem.name}
                        sx={{
                          width: '100%',
                          height: 300,
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <PhotoLibraryIcon
                            sx={{
                              fontSize: 64,
                              color: alpha(theme.palette.primary.main, 0.6)
                            }}
                          />
                          <Typography color="text.secondary">
                            No images available
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
              
                  {/* Item Details */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        {viewItem.description && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Description
                            </Typography>
                            <Typography variant="body1">
                              {viewItem.description}
                            </Typography>
                          </Box>
                        )}
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={4}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Category
                              </Typography>
                              <Chip 
                                label={viewItem.category}
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Status
                              </Typography>
                              <Chip 
                                label={viewItem.status}
                                size="small"
                                sx={{ 
                                  bgcolor: viewItem.status === 'active' 
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : viewItem.status === 'low stock'
                                      ? alpha(theme.palette.warning.main, 0.1)
                                      : alpha(theme.palette.error.main, 0.1),
                                  color: viewItem.status === 'active' 
                                    ? theme.palette.success.main
                                    : viewItem.status === 'low stock'
                                      ? theme.palette.warning.main
                                      : theme.palette.error.main
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Quantity
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {viewItem.quantity}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Cost Price
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {formatCurrency(viewItem.cost_price, viewItem.currency)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Selling Price
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {formatCurrency(viewItem.price, viewItem.currency)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Profit
                              </Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: viewItem.price - viewItem.cost_price > 0 
                                    ? theme.palette.success.main
                                    : theme.palette.error.main
                                }}
                              >
                                {formatCurrency(viewItem.price - viewItem.cost_price, viewItem.currency)}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    ml: 0.5,
                                    color: viewItem.price - viewItem.cost_price > 0 ? '#2e9e43' : '#e53935',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    opacity: 0.9
                                  }}
                                >
                                  ({viewItem.price > 0 ? ((viewItem.price - viewItem.cost_price) / viewItem.price * 100).toFixed(0) : 0}%)
                                </Typography>
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button 
                onClick={handleViewModalClose}
                sx={{
                  color: theme.palette.text.secondary,
                  mr: 'auto'
                }}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  if (viewItem) {
                    handleEdit(viewItem);
                    handleViewModalClose();
                  }
                }}
                startIcon={<EditIcon />}
                variant="outlined"
              >
                Edit
              </Button>
              <Button 
                onClick={() => {
                  if (viewItem) {
                    handleDeleteItem(viewItem.id);
                    handleViewModalClose();
                  }
                }}
                startIcon={<DeleteIcon />}
                variant="contained"
                color="error"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Add Inventory Side Sheet */}
          <AddInventorySideSheet 
            isOpen={isSideSheetOpen}
            onClose={handleSideSheetClose}
            onAdd={(itemData, mediaFiles) => {
              // Process uploaded image files and create a data URL for the first image
              let imageUrl = "";
              if (mediaFiles.length > 0) {
                // Convert the first image file to a data URL
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target && e.target.result) {
                    // Create a new item with the image data URL and media
                    const newItem: InventoryItem = {
                      id: nanoid(),
                      name: itemData.name || "New Product",
                      description: itemData.description || "",
                      category: itemData.category || "Electronics",
                      status: itemData.status || "active",
                      price: itemData.price || 0,
                      cost_price: itemData.cost_price || 0,
                      quantity: itemData.quantity || 0,
                      image: e.target.result as string, // Set the image property to the first media's data URL
                      image_ids: [], // Store image IDs for future reference
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      currency: itemData.currency || 'INR',
                      media: itemData.media || [] // Store all media files data
                    };
                    handleAddItem(newItem);
                  }
                };
                reader.readAsDataURL(mediaFiles[0]);
              } else {
                // Create item without image if no files were uploaded
                const newItem: InventoryItem = {
                  id: nanoid(),
                  name: itemData.name || "New Product",
                  description: itemData.description || "",
                  category: itemData.category || "Electronics",
                  status: itemData.status || "active",
                  price: itemData.price || 0,
                  cost_price: itemData.cost_price || 0,
                  quantity: itemData.quantity || 0,
                  image: "",
                  image_ids: [],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  currency: itemData.currency || 'INR',
                  media: []
                };
                handleAddItem(newItem);
              }
            }}
            currency="INR"
            categories={['Electronics', 'Clothing', 'Food', 'Home', 'Beauty']}
          />
        </Box>
      </Box>
    </Layout>
  );
}