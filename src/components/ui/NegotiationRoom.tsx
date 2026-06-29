import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getLotById, sendMessage, getMessagesForLot, updateLotStatus } from '../../services/supabaseApi';
import { DashboardLayout } from '../layout/DashboardLayout';
import { GlassCard } from './GlassCard';
import { Send, DollarSign, AlertCircle, Trophy, ArrowLeft, Building2, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export function NegotiationRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lot, setLot] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState<string>('');
  
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [processingPayout, setProcessingPayout] = useState(false);

  const isScraper = user?.id === lot?.scraper_id;
  // Note: For a true 1-on-1 we'd determine the recycler from the negotiations table, but for simplicity here we assume the other person chatting is the recycler.
  const otherPartyId = isScraper ? (messages.find(m => m.sender_id !== user?.id)?.sender_id) : lot?.scraper_id;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const lotData = await getLotById(id);
      setLot(lotData);
      
      const msgs = await getMessagesForLot(id);
      setMessages(msgs || []);
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
      scrollToBottom();
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

    const messagesSubscription = supabase
      .channel(`messages_${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `lot_id=eq.${id}` }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lotSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageInput.trim() || !lot) return;
    
    // If Scraper, receiver is the Recycler (otherPartyId). If Recycler, receiver is Scraper.
    // In a multi-recycler scenario, we'd need a specific room ID. Assuming 1 Recycler per lot for this prototype.
    const receiverId = isScraper ? otherPartyId : lot.scraper_id;

    if (!receiverId) {
      alert("No one is on the other side yet!");
      return;
    }

    try {
      await sendMessage(lot.id, user.id, receiverId, messageInput.trim());
      setMessageInput('');
      scrollToBottom();
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    }
  };

  const handleSettlePayment = async () => {
    if (!payoutAmount || !lot) return;
    setProcessingPayout(true);
    
    const amount = Number(payoutAmount);
    const platformFee = amount * 0.05; // 5% platform fee
    const scraperReceives = amount - platformFee;

    await new Promise(r => setTimeout(r, 1500)); // Simulate Razorpay
    
    try {
      // Mark lot as sold
      await updateLotStatus(lot.id, 'sold');
      // For simplicity, we just update the base_price to reflect final sold price in this prototype
      await supabase.from('scrap_lots').update({ base_price: amount }).eq('id', lot.id);

      alert(`Payment Successful!\nYou paid: ₹${amount}\nPlatform Fee: ₹${platformFee}\nScraper Received: ₹${scraperReceives}`);
      
      setPayoutAmount('');
      loadData();
    } catch (error) {
      console.error(error);
      alert('Failed to process payment.');
    } finally {
      setProcessingPayout(false);
    }
  };

  if (loading || !lot) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Lot Details & Settlement */}
          <div className="lg:col-span-1 space-y-4">
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="text-primary" size={24} />
                <h2 className="text-xl font-bold capitalize">Lot Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground-subtle">Category</p>
                  <p className="font-medium capitalize">{lot.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-subtle">Total Weight</p>
                  <p className="font-medium">{lot.weight_kg} kg</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-subtle">Base Request Price</p>
                  <p className="font-medium text-primary">₹{lot.base_price}</p>
                </div>
                {lot.description && (
                  <div>
                    <p className="text-sm text-foreground-subtle">Description</p>
                    <p className="font-medium text-sm p-3 bg-surface-elevated rounded-lg mt-1 border border-border">
                      {lot.description}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            {lot.status === 'sold' ? (
              <GlassCard className="p-6 text-center border-green-500/30 bg-green-500/5">
                <Trophy className="mx-auto text-green-500 mb-2" size={32} />
                <h3 className="font-bold text-green-500 text-lg">Lot Sold!</h3>
                <p className="text-sm text-foreground mt-2">
                  Final Price: ₹{lot.base_price}
                </p>
              </GlassCard>
            ) : !isScraper ? (
              <GlassCard className="p-6">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <DollarSign className="text-primary" size={20} />
                  Settle Payment
                </h3>
                <p className="text-sm text-foreground-subtle mb-4">
                  Once you agree on a price in the chat, enter it here to pay the Scraper securely via Razorpay.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Final Agreed Amount (₹)</label>
                    <input 
                      type="number"
                      min="0"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="input-field text-xl font-bold"
                      placeholder="e.g. 1000"
                    />
                  </div>

                  {payoutAmount && !isNaN(Number(payoutAmount)) && (
                    <div className="bg-background-elevated p-3 rounded-lg text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-foreground-subtle">Amount:</span>
                        <span>₹{Number(payoutAmount)}</span>
                      </div>
                      <div className="flex justify-between text-red-400">
                        <span>Platform Fee (5%):</span>
                        <span>-₹{(Number(payoutAmount) * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between font-bold text-green-500">
                        <span>Scraper Receives:</span>
                        <span>₹{(Number(payoutAmount) * 0.95).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSettlePayment}
                    disabled={processingPayout || !payoutAmount || isNaN(Number(payoutAmount)) || Number(payoutAmount) <= 0}
                    className="btn-primary w-full flex justify-center"
                  >
                    {processingPayout ? 'Processing...' : 'Pay via Razorpay'}
                  </button>
                </div>
              </GlassCard>
            ) : (
               <GlassCard className="p-6 text-center">
                 <AlertCircle className="mx-auto text-amber-500 mb-2" size={24} />
                 <h3 className="font-bold text-amber-500 mb-1">Waiting for Settlement</h3>
                 <p className="text-sm text-foreground-subtle">
                   Negotiate the final price in the chat. The recycler will make the payment from their dashboard.
                 </p>
               </GlassCard>
            )}
          </div>

          {/* Right Panel: Chat Room */}
          <div className="lg:col-span-2 flex flex-col h-[600px]">
            <GlassCard className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border bg-surface-elevated/30">
                <h3 className="font-bold text-lg">Negotiation Chat</h3>
                <p className="text-xs text-foreground-subtle">
                  Private chat between Scraper and Recycler.
                </p>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-foreground-muted flex-col gap-2">
                    <Send size={24} className="opacity-50" />
                    <p>No messages yet. Start the negotiation!</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-surface-elevated border border-border rounded-bl-sm'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-foreground-subtle'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {lot.status !== 'sold' ? (
                <div className="p-4 border-t border-border bg-surface-elevated/30">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="btn-primary p-2 aspect-square flex items-center justify-center rounded-lg"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 border-t border-border bg-surface-elevated/30 text-center text-foreground-muted text-sm">
                  This lot has been sold. The chat is closed.
                </div>
              )}
            </GlassCard>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
