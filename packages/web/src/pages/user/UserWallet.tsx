import { useState, useEffect } from 'react';
import { Wallet, ArrowUpDown, ArrowUp, ArrowDown, CreditCard, Clock, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { api } from '../../lib/api';
import { readStoredUser } from '../../services/authService';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
}

export function UserWallet() {
  const user = readStoredUser();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, txRes] = await Promise.all([
          api<{ user: { balance: number } }>('/api/auth/me').catch(() => ({ user: { balance: 0 } })),
          api<{ transactions: Transaction[] }>('/api/user-dashboard/transactions').catch(() => ({ transactions: [] })),
        ]);
        setBalance(profileRes.user?.balance || 0);
        setTransactions(txRes.transactions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDown className="h-4 w-4 text-green-600" />;
    if (type === 'withdrawal') return <ArrowUp className="h-4 w-4 text-red-600" />;
    return <CreditCard className="h-4 w-4 text-blue-600" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') return <Badge className="bg-green-500 text-white gap-1"><CheckCircle className="h-3 w-3" />Hoàn thành</Badge>;
    if (status === 'pending') return <Badge className="bg-yellow-500 text-white gap-1"><Clock className="h-3 w-3" />Đang xử lý</Badge>;
    return <Badge className="bg-red-500 text-white gap-1"><XCircle className="h-3 w-3" />Thất bại</Badge>;
  };

  const filteredTxs = transactions.filter(tx => {
    if (filter === 'deposit') return tx.type === 'deposit';
    if (filter === 'payment') return tx.type === 'payment';
    if (filter === 'withdrawal') return tx.type === 'withdrawal';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-accent to-accent/60 text-white">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div><p className="text-white/70 text-sm mb-1">Số dư khả dụng</p><h2 className="text-4xl font-bold">{loading ? <Skeleton className="h-12 w-48 bg-white/20" /> : formatCurrency(balance)}</h2></div>
            <div className="p-3 bg-white/10 rounded-xl"><Wallet className="h-8 w-8" /></div>
          </div>
          <div className="flex gap-3">
            <Button className="bg-white text-accent hover:bg-white/90 gap-2"><Plus className="h-4 w-4" />Nạp tiền</Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">Rút tiền</Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ArrowUpDown className="h-5 w-5" />Lịch sử giao dịch</CardTitle></CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="deposit">Nạp tiền</TabsTrigger>
              <TabsTrigger value="payment">Thanh toán</TabsTrigger>
              <TabsTrigger value="withdrawal">Rút tiền</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} className="mt-4">
              {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
               : filteredTxs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><ArrowUpDown className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Chưa có giao dịch nào</p></div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Giao dịch</TableHead><TableHead>Số tiền</TableHead><TableHead>Trạng thái</TableHead><TableHead>Ngày</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredTxs.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-muted">{getIcon(tx.type)}</div><div><p className="font-medium">{tx.description || `Giao dịch ${tx.type}`}</p><p className="text-xs text-muted-foreground capitalize">{tx.type}</p></div></div></TableCell>
                        <TableCell><span className={`font-semibold ${tx.type === 'deposit' ? 'text-green-600' : tx.type === 'withdrawal' ? 'text-red-600' : 'text-muted-foreground'}`}>{tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}{formatCurrency(tx.amount)}</span></TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
