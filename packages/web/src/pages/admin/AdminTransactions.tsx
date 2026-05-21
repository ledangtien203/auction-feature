import { useEffect, useState } from 'react';
import { Check, X, Filter, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { transactionService } from '../../services/transactionService';
import type { Transaction } from '../../types/transaction';
import { toast } from 'sonner';
import { broadcastSyncEvent } from '../../lib/syncStorage';

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await transactionService.getTransactions();
        if (!cancelled) setTransactions(list);
      } catch {
        if (!cancelled) setTransactions([]);
        toast.error('Không tải được giao dịch');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleApprove = async (id: string) => {
    try {
      const t = await transactionService.updateTransactionStatus(id, 'completed');
      setTransactions((prev) => prev.map((x) => (x.id === id ? t : x)));
      broadcastSyncEvent('transactions');
      toast.success('Đã duyệt giao dịch thành công');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const t = await transactionService.updateTransactionStatus(id, 'cancelled');
      setTransactions((prev) => prev.map((x) => (x.id === id ? t : x)));
      broadcastSyncEvent('transactions');
      toast.success('Đã từ chối giao dịch');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === 'pending').length,
    completed: transactions.filter((t) => t.status === 'completed').length,
    cancelled: transactions.filter((t) => t.status === 'cancelled').length,
    totalValue: transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Quản lý giao dịch</h1>
        <p className="text-muted-foreground">Quản lý tất cả giao dịch đấu giá</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Đang tải…</div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Tổng giao dịch</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-warning mb-1">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Chờ xử lý</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-success mb-1">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Hoàn tất</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="text-xl font-bold text-primary mb-1">
                  {formatCurrency(stats.totalValue)}
                </div>
                <div className="text-sm text-muted-foreground">Tổng giá trị</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả giao dịch</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="completed">Hoàn tất</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách giao dịch ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã GD</TableHead>
                    <TableHead>Người mua</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-accent/5">
                      <TableCell className="font-mono text-sm">
                        {transaction.id.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.userName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{transaction.auctionTitle}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(transaction.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'default'
                              : transaction.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className={
                            transaction.status === 'completed'
                              ? 'bg-success text-success-foreground'
                              : transaction.status === 'pending'
                                ? 'bg-warning text-warning-foreground'
                                : ''
                          }
                        >
                          {transaction.status === 'completed'
                            ? 'Hoàn tất'
                            : transaction.status === 'pending'
                              ? 'Chờ xử lý'
                              : 'Đã hủy'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(transaction.id)}
                              title="Duyệt giao dịch"
                              className="hover:bg-success/10 hover:text-success"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(transaction.id)}
                              title="Từ chối giao dịch"
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
