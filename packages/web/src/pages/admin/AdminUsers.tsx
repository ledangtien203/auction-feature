import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Mail, TrendingUp, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '../../components/ui/pagination';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { broadcastSyncEvent } from '../../lib/syncStorage';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  roleId: string;
  roleName: string | null;
  isVerified: boolean;
  isBlocked: boolean;
  balance: number;
  rating: number;
  createdAt: string;
  totalBids: number;
  totalSpent: number;
  role: string;
  status: string;
  joinDate: string;
}

const PAGE_SIZE = 10;

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api<AdminUser[]>('/api/admin/users');
      setUsers(data);
      setTotalUsers(data.length);
    } catch {
      toast.error('Không tải được danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    try {
      await api(`/api/admin/users/${userId}/status`, { method: 'PATCH' });
      await loadUsers();
      broadcastSyncEvent('users');
      toast.success('Đã cập nhật trạng thái người dùng');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || user.username).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const stats = {
    total: users.length,
    active: users.filter((u) => !u.isBlocked).length,
    suspended: users.filter((u) => u.isBlocked).length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Quản lý người dùng</h1>
        <p className="text-muted-foreground">Quản lý tất cả người dùng trên hệ thống</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Đang tải…</div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <UsersIcon className="h-5 w-5 text-accent" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div className="text-2xl font-bold mb-1">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Tổng người dùng</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <UserCheck className="h-5 w-5 text-success" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-success mb-1">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Đang hoạt động</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <UserX className="h-5 w-5 text-destructive" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-destructive mb-1">{stats.suspended}</div>
                <div className="text-sm text-muted-foreground">Bị đình chỉ</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{stats.admins}</div>
                <div className="text-sm text-muted-foreground">Quản trị viên</div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead>Lượt đặt giá</TableHead>
                    <TableHead>Tổng chi tiêu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Không có người dùng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-accent/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name || user.username}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                {(user.name || user.username).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{user.name || user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={
                              user.role === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{user.totalBids}</span> lượt
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(user.totalSpent)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={!user.isBlocked ? 'default' : 'destructive'}
                            className={
                              !user.isBlocked ? 'bg-success text-success-foreground' : ''
                            }
                          >
                            {!user.isBlocked ? 'Hoạt động' : 'Đình chỉ'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Gửi email"
                              className="hover:bg-accent/10 hover:text-accent"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(user.id)}
                              title={
                                !user.isBlocked
                                  ? 'Đình chỉ người dùng'
                                  : 'Kích hoạt người dùng'
                              }
                              className={
                                !user.isBlocked
                                  ? 'hover:bg-destructive/10 hover:text-destructive'
                                  : 'hover:bg-success/10 hover:text-success'
                              }
                            >
                              {!user.isBlocked ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
