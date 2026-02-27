import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RoleBadge } from '@/components/common/RoleBadge';
import type { UserRole, User } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Search,
  MoreHorizontal,
  Ban,
  CheckCircle2,
  Mail,
  Shield,
  UserX,
} from 'lucide-react';

export function UsersPage() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    }
    fetchUsers();
  }, []);

  const pageRole = location.pathname.includes('/instructors')
    ? 'instructor'
    : location.pathname.includes('/students')
      ? 'student'
      : 'all';

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = pageRole === 'all' || user.role === pageRole;
    return matchesSearch && matchesRole;
  });

  const pendingUsers = filteredUsers.filter(user => user.status === 'pending');
  const activeUsers = filteredUsers.filter(user => user.status === 'approved');
  const rejectedUsers = filteredUsers.filter(user => user.status === 'rejected');

  const handleBanUser = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { isActive });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isActive });
      }
      toast.success(`User ${isActive ? 'activated' : 'banned'} successfully`);
    } catch (err) {
      toast.error('Failed to change user status');
      console.error('Error updating user:', err);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/users/${userId}`, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as User['status'] } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus as User['status'] });
      }
      toast.success(`Instructor application ${newStatus}`);
      if (newStatus === 'approved') setShowActionModal(false);
    } catch (err) {
      toast.error('Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      toast.success(`Role changed to ${newRole}`);
    } catch (err) {
      toast.error('Failed to change role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to completely delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setShowActionModal(false);
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {pageRole === 'instructor' ? 'Instructor' : pageRole === 'student' ? 'Student' : 'User'} Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage platform {pageRole === 'instructor' ? 'instructors' : pageRole === 'student' ? 'students' : 'users'} and permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
              {pendingUsers.length} Pending
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
              {activeUsers.length} Active
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 border-none">
              {rejectedUsers.length} Rejected
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${pageRole === 'instructor' ? 'instructors' : pageRole === 'student' ? 'students' : 'users'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Pending Users Table */}
      {pendingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4">Pending Users</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Joined Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="p-4 py-2">
                          <p className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4 py-2">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStatus(user.id, 'approved')}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleUpdateStatus(user.id, 'rejected')}>
                              <UserX className="h-4 w-4 mr-2" /> Reject
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowActionModal(true);
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Users Table */}
      {activeUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-4">Active Users</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-left p-4 font-medium">Last Active</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 py-2">
                          <p className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4 py-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => window.location.href = `mailto:${user.email}`}>
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowActionModal(true);
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rejected Users Table */}
      {rejectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-4">Rejected Users</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-left p-4 font-medium">Last Active</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                              Application Rejected
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 py-2">
                          <p className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4 py-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => window.location.href = `mailto:${user.email}`}>
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowActionModal(true);
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No {pageRole === 'instructor' ? 'instructors' : pageRole === 'student' ? 'students' : 'users'} found</p>
        </div>
      )}

      {/* User Actions Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Actions</DialogTitle>
            <DialogDescription>
              Manage {selectedUser?.name}'s account
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <RoleBadge role={selectedUser.role} className="mt-1" />
                </div>
              </div>

              {selectedUser.role === 'instructor' && selectedUser.registrationComplete && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <h4 className="font-semibold text-foreground mb-3">Instructor Application Details</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <p className="text-muted-foreground text-xs">Primary Expertise</p>
                      <p className="font-medium">{selectedUser.primaryExpertise}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Experience Level</p>
                      <p className="font-medium">{selectedUser.experienceLevel}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Years of Experience</p>
                      <p className="font-medium">{selectedUser.yearsOfExperience} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Job Title</p>
                      <p className="font-medium">{selectedUser.currentJobTitle || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">Organization</p>
                      <p className="font-medium">{selectedUser.organization || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = `mailto:${selectedUser.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground cursor-pointer pointer-events-none" />
                  <select
                    className="w-full appearance-none pl-9 pr-4 py-2 h-9 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                    value={selectedUser.role}
                    onChange={(e) => handleChangeRole(selectedUser.id, e.target.value as UserRole)}
                  >
                    <option value="student" className="text-black bg-white">Role: Student</option>
                    <option value="instructor" className="text-black bg-white">Role: Instructor</option>
                    <option value="admin" className="text-black bg-white">Role: Admin</option>
                  </select>
                </div>
                {selectedUser.isActive ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={() => handleBanUser(selectedUser.id, false)}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-green-600 hover:text-green-700"
                    onClick={() => handleBanUser(selectedUser.id, true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Activate User
                  </Button>
                )}
                {selectedUser.role === 'instructor' && selectedUser.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'approved')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Instructor
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'rejected')}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Reject Instructor
                    </Button>
                  </div>
                )}
                <div className="pt-4 border-t space-y-2 mt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteUser(selectedUser.id)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
