import { useEffect, useState } from 'react';
import { Wallet, Search, RefreshCw, DollarSign, TrendingUp, Users, ArrowUp, ArrowDown, Eye, Plus, Minus, Loader2, CreditCard, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { adminWalletService } from '../../services/walletService';
import { toast } from 'sonner';

interface WalletInfo {
  id: number;
  userId: number;
  username: string;
  email: string;
  name: string | null;
  avatar: string | null;
  balance: number;
  totalTransactions: number;
  totalDeposit: number;
  totalPayment: number;
}

interface Transaction {
  id: number;
  userId: number;
  username: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

interface TopWallet {
  userId: number;
  username: string;
  email: string;
  name: string | null;
  balance: number;
}

export function AdminWallet() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [topWallets, setTopWallets] = useState<TopWallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<{
    totalBalance: number;
    todayCount: number;
    todayAmount: number;
    totalDeposits: number;
    totalWithdraws: number;
  } | null>(null);

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<WalletInfo | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Add/Deduct modal
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [moneyAction, setMoneyAction] = useState<'add' | 'deduct'>('add');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneyDescription, setMoneyDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [walletData, statsData] = await Promise.all([
        adminWalletService.getWallets({
          page,
          limit: 20,
          search: search || undefined,
        }),
        adminWalletService.getStats(),
      ]);
      
      setWallets(walletData.wallets);
      setTotalPages(walletData.pagination.totalPages);
      setStats({
        totalBalance: statsData.totalBalance,
        todayCount: statsData.todayTransactions.count,
        todayAmount: statsData.todayTransactions.amount,
        totalDeposits: statsData.typeStats.find(t => t.type === 'deposit')?.total || 0,
        totalWithdraws: statsData.typeStats.find(t => t.type === 'withdraw')?.total || 0,
      });
      setTopWallets(statsData.topWallets);
      setRecentTransactions(statsData.recentTransactions.map(t => ({
        ...t,
        username: t.username || 'Unknown'
      })));
    } catch (e) {
      console.error('Error fetching wallet data:', e);
      toast.error('Không thể tải dữ liệu ví');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const openUserDetail = async (user: WalletInfo) => {
    try {
      setSelectedUser(user);
      const data = await adminWalletService.getWalletDetails(String(user.userId));
      setUserTransactions(data.transactions);
      setShowDetailModal(true);
    } catch (e) {
      toast.error('Không thể tải chi tiết ví');
    }
  };

  const handleAddMoney = async () => {
    if (!selectedUser || !moneyAmount) return;

    try {
      setProcessing(true);
      await adminWalletService.addMoney(String(selectedUser.userId), Number(moneyAmount), moneyDescription);
      toast.success('Đã nạp tiền thành công');
      setShowMoneyModal(false);
      setShowDetailModal(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'Nạp tiền thất bại');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeductMoney = async () => {
    if (!selectedUser || !moneyAmount) return;

    try {
      setProcessing(true);
      await adminWalletService.deductMoney(String(selectedUser.userId), Number(moneyAmount), moneyDescription);
      toast.success('Đã trừ tiền thành công');
      setShowMoneyModal(false);
      setShowDetailModal(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'Trừ tiền thất bại');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getTypeIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDown className="h-4 w-4 text-green-600" />;
    if (type === 'withdraw' || type === 'withdrawal') return <ArrowUp className="h-4 w-4 text-red-600" />;
    return <CreditCard className="h-4 w-4 text-blue-600" />;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Nạp tiền',
      withdraw: 'Rút tiền',
      payment: 'Thanh toán',
      refund: 'Hoàn tiền',
      bid_refund: 'Hoàn cọc'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng số dư</p>
                <p className="text-2xl font-bold">{stats ? formatCurrency(stats.totalBalance) : '-'}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng nạp tiền</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.totalDeposits || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <ArrowDown className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng rút tiền</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats?.totalWithdraws || 0)}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-full">
                <ArrowUp className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Giao dịch hôm nay</p>
                <p className="text-2xl font-bold">{stats?.todayCount || 0}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <RefreshCw className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hôm nay</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats?.todayAmount || 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="wallets">
        <TabsList>
          <TabsTrigger value="wallets">Danh sách ví</TabsTrigger>
          <TabsTrigger value="topWallets">Ví có số dư cao</TabsTrigger>
          <TabsTrigger value="transactions">Giao dịch gần đây</TabsTrigger>
        </TabsList>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quản lý ví người dùng</CardTitle>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
                <Button type="submit" variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : wallets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có ví người dùng nào</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Tài khoản</TableHead>
                        <TableHead className="text-right">Số dư</TableHead>
                        <TableHead className="text-right">Tổng nạp</TableHead>
                        <TableHead className="text-right">Tổng chi</TableHead>
                        <TableHead className="text-center">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wallets.map((wallet) => (
                        <TableRow key={wallet.userId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {wallet.name?.charAt(0) || wallet.username.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{wallet.name || wallet.username}</p>
                                <p className="text-xs text-muted-foreground">{wallet.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">@{wallet.username}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-primary">{formatCurrency(wallet.balance)}</span>
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(wallet.totalDeposit || 0)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(wallet.totalPayment || 0)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" onClick={() => openUserDetail(wallet)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Trang {page} / {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                          Trước
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Wallets Tab */}
        <TabsContent value="topWallets">
          <Card>
            <CardHeader>
              <CardTitle>Top ví có số dư cao nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topWallets.map((wallet, index) => (
                  <div
                    key={wallet.userId}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{wallet.name || wallet.username}</p>
                      <p className="text-sm text-muted-foreground">{wallet.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{formatCurrency(wallet.balance)}</p>
                      <p className="text-sm text-muted-foreground">Số dư</p>
                    </div>
                  </div>
                ))}
                {topWallets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Giao dịch gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getTypeIcon(tx.type)}
                          {getTypeLabel(tx.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          tx.type === 'deposit' ? 'text-green-600' : 
                          tx.type === 'withdraw' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {tx.type === 'deposit' ? '+' : tx.type === 'withdraw' ? '-' : ''}
                          {formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{tx.description || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {recentTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Chưa có giao dịch nào</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết ví - {selectedUser?.name || selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Số dư hiện tại: <span className="font-semibold text-primary">{selectedUser && formatCurrency(selectedUser.balance)}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button onClick={() => { setMoneyAction('add'); setMoneyAmount(''); setMoneyDescription(''); setShowMoneyModal(true); }} className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Nạp tiền
              </Button>
              <Button onClick={() => { setMoneyAction('deduct'); setMoneyAmount(''); setMoneyDescription(''); setShowMoneyModal(true); }} variant="destructive" className="gap-2">
                <Minus className="h-4 w-4" />
                Trừ tiền
              </Button>
            </div>

            <h3 className="font-semibold">Lịch sử giao dịch</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {userTransactions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Chưa có giao dịch nào</p>
              ) : (
                userTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(tx.type)}
                      <div>
                        <p className="font-medium text-sm">{tx.description || getTypeLabel(tx.type)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      tx.type === 'deposit' ? 'text-green-600' : 
                      tx.type === 'withdraw' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'withdraw' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Deduct Money Modal */}
      <Dialog open={showMoneyModal} onOpenChange={setShowMoneyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moneyAction === 'add' ? 'Nạp tiền' : 'Trừ tiền'} cho {selectedUser?.name || selectedUser?.username}
            </DialogTitle>
            <DialogDescription>
              Số dư hiện tại: {formatCurrency(selectedUser?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Số tiền (VND)</label>
              <Input
                type="number"
                placeholder="Nhập số tiền..."
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Mô tả (tùy chọn)</label>
              <Input
                placeholder="VD: Hoàn tiền, Thưởng..."
                value={moneyDescription}
                onChange={(e) => setMoneyDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoneyModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={moneyAction === 'add' ? handleAddMoney : handleDeductMoney}
              disabled={processing || !moneyAmount}
              variant={moneyAction === 'add' ? 'default' : 'destructive'}
              className={moneyAction === 'add' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {moneyAction === 'add' ? 'Nạp tiền' : 'Trừ tiền'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
