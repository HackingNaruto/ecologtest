// Replace your imports with these to ensure type safety
import { useEffect, useState } from 'react'; // Add this line!
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatCard } from '../components/ui/StatCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, Truck, IndianRupee, Activity } from 'lucide-react';
// ... rest of your code

// Define the type for joined data
type PickupWithItems = any; // You can define this more strictly later if needed

export function Dashboard() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState<PickupWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('pickup_requests')
        .select(`
          *,
          pickup_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPickups(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Use optional chaining (?.) to prevent "undefined" errors
  const allItems = pickups.flatMap(p => p.pickup_items || []);
  const totalItems = allItems.length;
  const completedItems = allItems.filter(i => i.condition === 'processed').length; 
  
  const totalValue = pickups.reduce((sum, p) => 
    sum + (p.pickup_items?.reduce((acc: number, item: any) => acc + (Number(item.estimated_value_per_unit) * Number(item.quantity)), 0) || 0), 0
  );

  return (
    <DashboardLayout>
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Devices" value={totalItems} icon={Package} />
        <StatCard title="Pending" value={pickups.filter(p => p.status === 'pending').length} icon={Truck} />
        <StatCard title="Value Recovered" value={`₹${totalValue}`} icon={IndianRupee} />
        <StatCard title="Impact Score" value={completedItems * 5} icon={Activity} />
      </div>
      
      {/* Rest of your UI remains exactly as you had it */}
    </DashboardLayout>
  );
}