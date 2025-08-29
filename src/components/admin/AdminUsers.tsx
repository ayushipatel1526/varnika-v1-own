import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Crown, User } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('user_id', userId);

      if (error) throw error;
      
      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId ? { ...user, is_admin: isAdmin } : user
        )
      );
      
      toast.success(`User ${isAdmin ? 'promoted to' : 'removed from'} admin`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Users</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {user.is_admin ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {user.full_name || 'No name'}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                {user.is_admin && (
                  <Badge variant="secondary">Admin</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{user.phone}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Admin Access</span>
                  <Switch
                    checked={user.is_admin}
                    onCheckedChange={(checked) => 
                      toggleAdminStatus(user.user_id, checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found.</p>
        </div>
      )}
    </div>
  );
};