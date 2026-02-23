import { useState, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleBanUser = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { isActive });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, isActive });
      }
    } catch (err) {
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
    } catch (err) {
      console.error('Error updating status:', err);
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
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage platform users and permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {users.length} total users
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
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
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
                  {filteredUsers.map((user, index) => (
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
                          {user.role === 'instructor' && user.status === 'pending' && (
                            <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">
                              Pending Admin Approval
                            </Badge>
                          )}
                          {user.role === 'instructor' && user.status === 'approved' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Approved
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
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
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

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
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Role
                </Button>
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
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
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
