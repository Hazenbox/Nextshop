import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { transactionService, mockTransactions } from '../lib/supabase';
import { Transaction } from '../types';
import { AddTransactionSideSheet } from '../components/AddTransactionSideSheet';

// Material UI imports
import {
  Box,
  Typography,
  Paper,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack,
  Container,
  Alert
} from '@mui/material';

// Material UI icons
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  ArrowUpward as ArrowUpwardIcon, 
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

export function TransactionsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransactionSideSheetOpen, setIsTransactionSideSheetOpen] = useState(false);
  
  // Sort state
  const [orderBy, setOrderBy] = useState<keyof Transaction>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await transactionService.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError('Failed to load transactions. Please try again.');
        setTransactions(mockTransactions); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const handleRequestSort = (property: keyof Transaction) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(id);
        setTransactions(prev => prev.filter(tx => tx.id !== id));
      } catch (err) {
        console.error('Error deleting transaction:', err);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    console.log('Edit transaction:', transaction);
    setIsTransactionSideSheetOpen(true);
  };

  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Date', 'Type', 'Amount', 'Payment Mode', 'Reference', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(tx => {
          const row = [
            `"${new Date(tx.date).toLocaleDateString()}"`,
            `"${tx.type}"`,
            tx.amount,
            `"${tx.payment_mode}"`,
            `"${tx.reference || ''}"`,
            `"${tx.notes || ''}"`,
          ];
          return row.join(',');
        })
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Failed to export transaction data');
    }
  };

  // Filter and sort transactions
  const sortedTransactions = React.useMemo(() => {
    const filtered = transactions.filter(tx => {
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const amount = tx.amount.toString();
        const date = new Date(tx.date).toLocaleDateString();
        const paymentMode = tx.payment_mode.toLowerCase();
        const reference = tx.reference?.toLowerCase() || '';
        const notes = tx.notes?.toLowerCase() || '';
        
        return (
          amount.includes(searchLower) ||
          date.includes(searchLower) ||
          paymentMode.includes(searchLower) ||
          reference.includes(searchLower) ||
          notes.includes(searchLower)
        );
      }
      
      return true;
    });
    
    return filtered.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (orderBy === 'date') {
        return (order === 'asc' ? 1 : -1) * 
          (new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return (order === 'asc' ? 1 : -1) * aValue.localeCompare(bValue);
      }
      
      // For numbers
      if (aValue !== null && bValue !== null) {
        return (order === 'asc' ? 1 : -1) * 
          ((aValue as number) - (bValue as number));
      }
      
      return 0;
    });
  }, [transactions, selectedType, searchTerm, orderBy, order]);

  // Calculate totals
  const totalIncome = React.useMemo(() => {
    return sortedTransactions
      .filter((tx: Transaction) => tx.type === 'income')
      .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
  }, [sortedTransactions]);
    
  const totalExpense = React.useMemo(() => {
    return sortedTransactions
      .filter((tx: Transaction) => tx.type === 'expense')
      .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
  }, [sortedTransactions]);
    
  const netAmount = totalIncome - totalExpense;

  // Mobile view: Transaction cards
  const renderTransactionCards = () => (
    <Stack spacing={2} sx={{ p: 2 }}>
      {sortedTransactions.map((transaction: Transaction) => (
        <Card key={transaction.id} elevation={1} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box 
                  sx={{ 
                    bgcolor: transaction.type === 'income' ? 'primary.50' : 'error.50',
                    color: transaction.type === 'income' ? 'primary.main' : 'error.main',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {transaction.type === 'income' 
                    ? <ArrowUpwardIcon /> 
                    : <ArrowDownwardIcon />}
                </Box>
                <Stack>
                  <Typography variant="body1" fontWeight="medium">
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.payment_mode}
                  </Typography>
                </Stack>
              </Stack>
              <Typography 
                variant="body1" 
                fontWeight="medium"
                color={transaction.type === 'income' ? 'primary.main' : 'error.main'}
              >
                ₹{transaction.amount.toLocaleString()}
              </Typography>
            </Box>
            
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}
              </Typography>
            </Stack>
            
            {(transaction.reference || transaction.notes) && (
              <>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.5} mt={1}>
                  {transaction.reference && (
                    <Typography variant="body2" color="text.secondary">
                      <Typography component="span" fontWeight="medium">Reference:</Typography> {transaction.reference}
                    </Typography>
                  )}
                  {transaction.notes && (
                    <Typography variant="body2" color="text.secondary">
                      <Typography component="span" fontWeight="medium">Notes:</Typography> {transaction.notes}
                    </Typography>
                  )}
                </Stack>
              </>
            )}
            
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Tooltip title="Edit">
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={() => handleEdit(transaction)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleDelete(transaction.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  // Desktop view: Transaction table
  const renderTransactionTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell 
              sortDirection={orderBy === 'date' ? order : false}
              onClick={() => handleRequestSort('date')}
              sx={{ cursor: 'pointer' }}
            >
              <TableSortLabel
                active={orderBy === 'date'}
                direction={orderBy === 'date' ? order : 'asc'}
              >
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell 
              sortDirection={orderBy === 'type' ? order : false}
              onClick={() => handleRequestSort('type')}
              sx={{ cursor: 'pointer' }}
            >
              <TableSortLabel
                active={orderBy === 'type'}
                direction={orderBy === 'type' ? order : 'asc'}
              >
                Type
              </TableSortLabel>
            </TableCell>
            <TableCell 
              sortDirection={orderBy === 'amount' ? order : false}
              onClick={() => handleRequestSort('amount')}
              sx={{ cursor: 'pointer' }}
            >
              <TableSortLabel
                active={orderBy === 'amount'}
                direction={orderBy === 'amount' ? order : 'asc'}
              >
                Amount
              </TableSortLabel>
            </TableCell>
            <TableCell 
              sortDirection={orderBy === 'payment_mode' ? order : false}
              onClick={() => handleRequestSort('payment_mode')}
              sx={{ cursor: 'pointer' }}
            >
              <TableSortLabel
                active={orderBy === 'payment_mode'}
                direction={orderBy === 'payment_mode' ? order : 'asc'}
              >
                Payment Mode
              </TableSortLabel>
            </TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTransactions.map((transaction: Transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell>
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}
              </TableCell>
              <TableCell>
                <Chip 
                  label={transaction.type === 'income' ? 'Income' : 'Expense'}
                  color={transaction.type === 'income' ? 'primary' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography
                  color={transaction.type === 'income' ? 'primary.main' : 'error.main'}
                  fontWeight="medium"
                >
                  ₹{transaction.amount.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>{transaction.payment_mode}</TableCell>
              <TableCell>{transaction.reference || '—'}</TableCell>
              <TableCell sx={{ maxWidth: 200 }}>
                <Typography noWrap title={transaction.notes || '—'}>
                  {transaction.notes || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEdit(transaction)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Main content renderer based on state
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          {sortedTransactions.length > 0 && (
            isMobile ? renderTransactionCards() : renderTransactionTable()
          )}
        </Box>
      );
    }
    
    if (sortedTransactions.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 8,
          color: 'text.secondary'
        }}>
          <Typography gutterBottom>No transactions found.</Typography>
          <Typography>Try adjusting your filters or add a new transaction.</Typography>
        </Box>
      );
    }
    
    return isMobile ? renderTransactionCards() : renderTransactionTable();
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>Transactions</Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your income and expenses, and track your financial activity.
            </Typography>
          </Box>
          
          {/* Summary cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Income
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ 
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex'
                  }}>
                    <ArrowUpwardIcon />
                  </Box>
                  <Typography variant="h5" color="primary.main">
                    ₹{totalIncome.toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Expense
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ 
                    bgcolor: 'error.50',
                    color: 'error.main',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex'
                  }}>
                    <ArrowDownwardIcon />
                  </Box>
                  <Typography variant="h5" color="error.main">
                    ₹{totalExpense.toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Net Balance
                </Typography>
                <Typography 
                  variant="h5" 
                  color={netAmount >= 0 ? 'primary.main' : 'error.main'}
                >
                  ₹{netAmount.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Filters and Actions Row */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2} 
              sx={{ flex: 1 }}
            >
              {/* Search Input */}
              <TextField
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ maxWidth: { sm: 400 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton 
                        edge="end" 
                        onClick={() => setSearchTerm('')}
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />

              {/* Type Filter */}
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="transaction-type-label">Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'all' | 'income' | 'expense')}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Action Buttons */}
            <Stack 
              direction="row" 
              spacing={2}
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            >
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setIsTransactionSideSheetOpen(true)}
              >
                Add Transaction
              </Button>
            </Stack>
          </Stack>
          
          {/* Main Content */}
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }} elevation={1}>
            {renderContent()}
          </Paper>
          
          {/* Transaction Side Sheet */}
          <AddTransactionSideSheet
            isOpen={isTransactionSideSheetOpen}
            onClose={() => setIsTransactionSideSheetOpen(false)}
          />
        </Box>
      </Container>
    </Layout>
  );
}