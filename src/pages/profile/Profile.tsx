import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const { addNotification } = useNotificationStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };
      
      await updateUser(updatedUser);
      setIsEditing(false);
      
      addNotification({
        type: 'status_update',
        title: 'Profile Updated',
        message: 'Your profile information has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card 
            title="Profile Information"
            actions={
              isEditing ? (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        phone: user.phone || '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    icon={<Save className="h-4 w-4" />}
                    isLoading={isSaving}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )
            }
          >
            <div className="space-y-6">
              <div>
                <Input
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={<User className="h-5 w-5 text-gray-400" />}
                  fullWidth
                />
              </div>
              
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                  fullWidth
                />
              </div>
              
              <div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  icon={<Phone className="h-5 w-5 text-gray-400" />}
                  fullWidth
                />
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card>
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <span className="text-3xl font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              
              <div className="mt-6 w-full space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{user.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 capitalize">
                    {user.role} permissions
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;