import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getLotById, placeBid, updateLotStatus, closeAuctionSecurely } from '../../services/supabaseApi';
import { DashboardLayout } from '../layout/DashboardLayout';
import { GlassCard } from './GlassCard';
import { Clock, TrendingUp, AlertCircle, Trophy, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AUCTION_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export function LiveAuctionRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lot, setLot] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [placingBid, setPlacingBid] = useState(false);
  
  // Timers
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout>();

  const isHost = user?.id === lot?.scraper_id;

  const loadData = async () => {
    if (!id) return;
    try {
      const lotData = await getLotById(id);
      setLot(lotData);
      
      const { data: bidsData } = await supabase
        .from('bids')
        .select('*, profiles!bids_recycler_id_fkey(full_name)')
        .eq('lot_id', id)
        .order('amount', { ascending: false });
        
      setBids(bidsData || []);
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Realtime subscriptions
    const lotSubscription = supabase
      .channel(`lot_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scrap_lots', filter: `id=eq.${id}` }, () => {
        loadData();
      })
      .subscribe();

    const bidsSubscription = supabase
      .channel(`bids_${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `lot_id=eq.${id}` }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lotSubscription);
      supabase.removeChannel(bidsSubscription);
    };
  }, [id]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Engine Logic
  useEffect(() => {
    if (!lot) return;
    
    const startTime = new Date(lot.scheduled_start_time).getTime();
    
    // 1. Start the auction if scheduled time has passed and we are the host
    if (lot.status === 'scheduled' && currentTime >= startTime && isHost) {
      const auctionEndTime = new Date(startTime + AUCTION_DURATION_MS).toISOString();
      updateLotStatus(lot.id, 'live', auctionEndTime);
    }
    
    // 2. End the auction if timer is up and we are the host
    if (lot.status === 'live' && lot.auction_end_time) {
      const endTime = new Date(lot.auction_end_time).getTime();
      if (currentTime >= endTime && isHost) {
        closeAuctionSecurely(lot.id);
      }
    }
  }, [currentTime, lot, isHost]);

  if (loading || !lot) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const highestBid = bids.length > 0 ? bids[0].amount : lot.base_price;
  const highestBidderId = bids.length > 0 ? bids[0].recycler_id : null;
  const isWinning = user?.id === highestBidderId;

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || placingBid) return;
    
    const amount = Number(bidAmount);
    if (isNaN(amount) || amount <= highestBid) {
      alert(`Bid must be higher than ₹${highestBid}`);
      return;
    }

    setPlacingBid(true);
    try {
      await placeBid(lot.id, user.id, amount);
      setBidAmount('');
    } catch (err) {
      console.error(err);
      alert('Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  const renderTimer = () => {
    if (lot.status === 'scheduled') {
      const startTime = new Date(lot.scheduled_start_time).getTime();
      const timeUntilStart = Math.max(0, startTime - currentTime);
      const m = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((timeUntilStart % (1000 * 60)) / 1000);
      return `Starts in ${m}m ${s}s`;
    }
    if (lot.status === 'live' && lot.auction_end_time) {
      const endTime = new Date(lot.auction_end_time).getTime();
      const timeLeft = Math.max(0, endTime - currentTime);
      const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((timeLeft % (1000 * 60)) / 1000);
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return 'Auction Closed';
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Main Stage */}
          <div className="md:col-span-2 space-y-4">
            <GlassCard className="p-6 relative overflow-hidden">
              {lot.status === 'live' && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-red-500 animate-pulse" />
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold capitalize text-primary mb-1">
                    {lot.category.replace(/_/g, ' ')} Lot
                  </h1>
                  <p className="text-sm text-foreground-subtle">
                    {lot.weight_kg} kg • Base Price: ₹{lot.base_price} • Hosted by: {lot.profiles?.full_name || 'Verified Scraper'}
                  </p>
                </div>
                
                <div className={`px-4 py-2 rounded-lg font-mono text-xl font-bold flex items-center gap-2 ${lot.status === 'live' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  <Clock size={20} />
                  {renderTimer()}
                </div>
              </div>

              {lot.status === 'completed' && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center mb-6"
                >
                  <Trophy className="mx-auto text-green-500 mb-3" size={48} />
                  <h2 className="text-2xl font-bold text-green-500 mb-1">Auction Completed</h2>
                  <p className="text-foreground">
                    Winning Bid: <span className="font-bold">₹{lot.winning_bid_amount}</span>
                  </p>
                  {isHost ? (
                    <p className="text-sm text-green-400 mt-2">You successfully sold this lot!</p>
                  ) : isWinning ? (
                    <p className="text-sm font-bold text-green-400 mt-2">Congratulations! You won this auction.</p>
                  ) : (
                    <p className="text-sm text-foreground-subtle mt-2">Better luck next time.</p>
                  )}
                </motion.div>
              )}

              <div className="bg-background-elevated rounded-xl p-8 text-center border border-border/50">
                <p className="text-sm text-foreground-muted mb-2 uppercase tracking-widest font-semibold">Current Highest Bid</p>
                <div className="text-6xl font-bold text-primary flex items-center justify-center gap-2">
                  ₹{highestBid}
                </div>
                {lot.status === 'live' && !isHost && (
                  <p className="mt-4 text-sm font-medium">
                    {isWinning ? (
                      <span className="text-green-500 flex items-center justify-center gap-1"><Trophy size={16}/> You have the highest bid!</span>
                    ) : (
                      <span className="text-amber-500 flex items-center justify-center gap-1"><AlertCircle size={16}/> You are being outbid!</span>
                    )}
                  </p>
                )}
              </div>
            </GlassCard>

            {!isHost && lot.status === 'live' && (
              <GlassCard className="p-4">
                <form onSubmit={handlePlaceBid} className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      required
                      min={highestBid + 1}
                      placeholder={`Min bid: ₹${highestBid + 1}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full bg-background rounded-lg border border-border px-4 py-3 text-lg font-bold outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={placingBid || !bidAmount}
                    className="btn-primary px-8 text-lg flex items-center gap-2"
                  >
                    <TrendingUp size={20} />
                    Bid
                  </button>
                </form>
              </GlassCard>
            )}
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Live Activity</h3>
            <GlassCard className="p-4 h-[400px] overflow-y-auto space-y-3">
              {bids.length === 0 ? (
                <p className="text-sm text-center text-foreground-muted py-8">Waiting for bids...</p>
              ) : (
                bids.map((bid, i) => (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${i === 0 ? 'bg-primary/5 border-primary/30' : 'bg-background-elevated border-border/50'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{bid.profiles?.full_name || 'Recycler'}</span>
                      <span className="text-xs text-foreground-subtle">
                        {new Date(bid.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-primary">₹{bid.amount}</div>
                  </motion.div>
                ))
              )}
            </GlassCard>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
