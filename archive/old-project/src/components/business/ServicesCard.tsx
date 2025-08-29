import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { ServiceOffering } from '@/types/business';

interface ServicesCardProps {
  services: ServiceOffering[];
  onServicesUpdate: (services: ServiceOffering[]) => void;
}

const ServicesCard: React.FC<ServicesCardProps> = ({ services, onServicesUpdate }) => {
  const [newService, setNewService] = useState<Omit<ServiceOffering, 'id'>>({
    name: '',
    description: '',
    price: '',
    category: '',
    duration: ''
  });

  const addService = () => {
    if (newService.name && newService.price) {
      const service: ServiceOffering = {
        ...newService,
        id: Date.now().toString()
      };
      onServicesUpdate([...services, service]);
      setNewService({ name: '', description: '', price: '', category: '', duration: '' });
    }
  };

  const removeService = (id: string) => {
    onServicesUpdate(services.filter(service => service.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services & Products</CardTitle>
        <CardDescription>Manage your offerings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Services */}
        {services.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Current Offerings</h4>
            {services.map((service) => (
              <div key={service.id} className="p-3 border rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <h5 className="font-medium">{service.name}</h5>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>Price: {service.price}</span>
                    {service.duration && <span>Duration: {service.duration}</span>}
                    {service.category && <span>Category: {service.category}</span>}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeService(service.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Service */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium">Add New Service/Product</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                placeholder="e.g., Personal Training"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="servicePrice">Price</Label>
              <Input
                id="servicePrice"
                placeholder="e.g., $50/hour"
                value={newService.price}
                onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="serviceDescription">Description</Label>
            <Textarea
              id="serviceDescription"
              placeholder="Describe this service..."
              value={newService.description}
              onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="serviceCategory">Category</Label>
              <Input
                id="serviceCategory"
                placeholder="e.g., Fitness, Consultation"
                value={newService.category}
                onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="serviceDuration">Duration (optional)</Label>
              <Input
                id="serviceDuration"
                placeholder="e.g., 1 hour, 30 minutes"
                value={newService.duration}
                onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={addService} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesCard;
